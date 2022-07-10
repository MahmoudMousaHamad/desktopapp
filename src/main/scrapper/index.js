/* eslint-disable no-new-require */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-labels */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint global-require: off, no-console: off, promise/always-return: off */

const { path: chromePath } = require("chromedriver");
const path = require("path");
const chrome = require("selenium-webdriver/chrome");
const { exec } = require("child_process");
const { Builder } = require("selenium-webdriver");
const StreamZip = require("node-stream-zip");
const { app, dialog } = require("electron");
const process = require("process");
const https = require("https");
const fs = require("fs");
const os = require("os");

const { Locator, TITLE } = require("./Locator");
const { SingletonClassifier } = require("./Classifier");

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, "assets")
  : path.join(__dirname, "../../../assets");

const getAssetPath = (...paths) => {
  return path.join(RESOURCES_PATH, ...paths);
};

let appDatatDirPath;

class Scraper {
  constructor() {
    this.driver = undefined;
    this.running = null;
  }

  async start() {
    console.log("Starting bot");
    this.running = "running";

    this.openSession();
    await this.attachToSession();

    this.locator = new Locator(this.driver);
    await this.locator.goToJobsPage();

    await this.waitUntilSignIn();

    await this.run();
  }

  async stop() {
    console.log("Stopping bot");
    this.running = "stopped";
    await this.driver.close();
    SingletonClassifier.save();
  }

  pause() {
    console.log("Pausing bot");
    this.running = "paused";
  }

  async resume() {
    console.log("Resume bot");
    this.running = "running";
    await this.run();
  }

  getRunning() {
    // console.log("Driver to string: ", this.driver?.toString());
    return this.running;
  }

  async waitUntilSignIn() {
    await new Promise((resolve) => {
      this.interval = setInterval(async () => {
        if (
          (await this.driver.getPageSource()).toLowerCase().includes("sign in")
        ) {
          clearInterval(this.interval);
          resolve();
        }
      }, 1000);
    });
  }

  async run() {
    while (this.running === "running") {
      for (const key in this.locator.locationsAndActions) {
        if (key in this.locator.locationsAndActions) {
          const value = this.locator.locationsAndActions[key];
          let string = "";
          try {
            string =
              value.type === TITLE
                ? await this.locator.getTitle()
                : await this.locator.getPageSource();
          } catch (e) {
            console.error(e);
            this.pause();
            await this.resume();
          }

          if (!string) {
            await this.locator.goToJobsPage();
            break;
          }

          if (
            value.strings.some((s) =>
              string.toLowerCase().includes(s.toLowerCase())
            )
          ) {
            try {
              console.log("Running action for", key);
              await value.action();
              await this.driver.sleep(1000);
            } catch (e) {
              await new Promise((resolve) => {
                setTimeout(async () => {
                  try {
                    await value.action();
                  } catch (e2) {
                    console.error(e2);
                    await this.locator.goToJobsPage();
                  }
                  resolve();
                }, 5000);
              });
            }
          }
        }
      }
      await this.locator.goToJobsPage();
    }
  }

  openSession() {
    // Open chrome on specified port
    exec(
      'google-chrome --remote-debugging-port=9222 --user-data-dir="/home/mahmoud/userchromedata"',
      (error, stdout, stderr) => {
        if (stdout) {
          console.log(`stdout: ${stdout}`);
          if (
            stdout &&
            stdout.toLowerCase().includes("existing browser session")
          ) {
            this.sessionAlreadyOpen = true;
          } else {
            this.attachToSession = false;
          }
        }
        stderr && console.log(`stderr: ${stderr}`);
        if (error !== null) {
          console.log(`exec error: ${error}`);
        }
      }
    );
  }

  async downloadChromeDriver() {
    const chromeVersion = await require("find-chrome-version")();
    const chromeMajorVersion = chromeVersion.split(".")[0];
    console.log("Chrome major version", chromeMajorVersion);

    if (Number(chromeMajorVersion) < 100) {
      dialog.showErrorBox(
        "Google Chrome Version Error",
        `Unfortunately, we don't support your current version of Chrome (${chromeMajorVersion}).
        As of now, we only support Chrome versions 100 and above. Please consider updating your
        Google Chrome browser.`
      );

      setTimeout(() => {
        app.exit(1);
      }, 5000);

      return;
    }

    const versionIndex = {
      104: "104.0.5112.29",
      103: "103.0.5060.53",
      102: "102.0.5005.61",
      101: "101.0.4951.41",
      100: "100.0.4896.60",
    };

    let targetPlatform;
    const platform = os.platform();

    switch (platform) {
      case "darwin":
        targetPlatform = os.cpus()[0].model.includes("Apple")
          ? "mac64_m1"
          : "mac64";
        break;
      case "linux":
        targetPlatform = "linux64";
        break;
      case "win32":
        targetPlatform = "win32";
        break;
      default:
        throw Error("Unknown OS platform");
    }

    console.log("Target platform", targetPlatform);

    const fileUrl = `https://chromedriver.storage.googleapis.com/${versionIndex[chromeMajorVersion]}/chromedriver_${targetPlatform}.zip`;
    console.log("Zip file url", fileUrl);
    const file = fs.createWriteStream(
      getAssetPath("driver", "chromedriver.zip")
    );

    const request = https.get(fileUrl, (response) => {
      response.pipe(file);

      // after download completed close filestream
      file.on("finish", () => {
        file.close();
        console.log("Download Completed");
      });
    });
  }

  async attachToSession() {
    const myChromePath = path.join(appDatatDirPath, "chromedriver");
    console.log("Chrome driver path:", myChromePath);
    const service = new chrome.ServiceBuilder(myChromePath).build();
    chrome.setDefaultService(service);

    const options = new chrome.Options();
    // eslint-disable-next-line no-underscore-dangle
    options.options_.debuggerAddress = "localhost:9222";

    this.driver = await new Builder()
      .withCapabilities({ unexpectedAlertBehaviour: "accept" })
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  }
}

async function downloadChromeDriver() {
  const chromeVersion = await require("find-chrome-version")();
  const chromeMajorVersion = chromeVersion.split(".")[0];
  console.log("Chrome major version", chromeMajorVersion);

  if (Number(chromeMajorVersion) < 100) {
    dialog.showErrorBox(
      "Google Chrome Version Error",
      `Unfortunately, we don't support your current version of Chrome (${chromeMajorVersion}).
      As of now, we only support Chrome versions 100 and above. Please consider updating your
      Google Chrome browser.`
    );

    setTimeout(() => {
      app.exit(1);
    }, 5000);

    return;
  }

  const versionIndex = {
    104: "104.0.5112.29",
    103: "103.0.5060.53",
    102: "102.0.5005.61",
    101: "101.0.4951.41",
    100: "100.0.4896.60",
  };

  let targetPlatform;
  const platform = os.platform();

  switch (platform) {
    case "darwin":
      targetPlatform = os.cpus()[0].model.includes("Apple")
        ? "mac64_m1"
        : "mac64";
      appDatatDirPath = path.join(
        process.env.HOME,
        "Library",
        "Application Support",
        "JobApplier"
      );
      break;
    case "linux":
      targetPlatform = "linux64";
      appDatatDirPath = path.join(process.env.HOME, ".JobApplier");
      break;
    case "win32":
      targetPlatform = "win32";
      appDatatDirPath = path.join(process.env.APPDATA, "JobApplier");
      break;
    default:
      throw Error("Unknown OS platform");
  }

  console.log("Target platform", targetPlatform);
  console.log("appDatatDirPath", appDatatDirPath);

  if (!fs.existsSync(appDatatDirPath)) {
    fs.mkdirSync(appDatatDirPath);
  }

  const fileUrl = `https://chromedriver.storage.googleapis.com/${versionIndex[chromeMajorVersion]}/chromedriver_${targetPlatform}.zip`;
  console.log("Zip file url", fileUrl);

  const file = fs.createWriteStream(
    path.join(appDatatDirPath, "chromedriver.zip")
  );
  const request = https.get(fileUrl, (response) => {
    response.pipe(file);

    // after download completed close filestream
    file.on("finish", async () => {
      file.close();
      console.log("Download of zip file ended, unzipping...");

      const zip = new StreamZip.async({
        file: path.join(appDatatDirPath, "chromedriver.zip"),
      });
      await zip.extract(
        "chromedriver",
        path.join(appDatatDirPath, "chromedriver")
      );
      await zip.close();

      fs.chmodSync(path.join(appDatatDirPath, "chromedriver"), "755");
    });
  });
}

module.exports = {
  Scraper,
  downloadChromeDriver,
};
