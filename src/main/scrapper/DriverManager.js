/* eslint-disable no-underscore-dangle */
/* eslint-disable new-cap */
/* eslint-disable global-require */
const chrome = require("selenium-webdriver/chrome");
const { Builder } = require("selenium-webdriver");
const StreamZip = require("node-stream-zip");
const { app, dialog } = require("electron");
const { exec } = require("child_process");
const https = require("https");
const path = require("path");
const fs = require("fs");

const { appDatatDirPath, targetPlatform } = require("./OSHelper");

const versionIndex = {
  104: "104.0.5112.29",
  103: "103.0.5060.53",
  102: "102.0.5005.61",
  101: "101.0.4951.41",
  100: "100.0.4896.60",
};

async function getChromeMajorVersion() {
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

    return false;
  }

  return chromeMajorVersion;
}

async function downloadChromeDriver() {
  const chromeMajorVersion = await getChromeMajorVersion();

  if (!chromeMajorVersion)
    throw Error("Chrome version is not compatibale with this application.");

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

function openChromeSession() {
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

      if (stderr) console.log(`stderr: ${stderr}`);

      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    }
  );
}

async function attachToSession() {
  const myChromePath = path.join(appDatatDirPath, "chromedriver");
  console.log("Chrome driver path:", myChromePath);

  const service = new chrome.ServiceBuilder(myChromePath).build();
  chrome.setDefaultService(service);

  const options = new chrome.Options();
  options.options_.debuggerAddress = "localhost:9222";

  const driver = await new Builder()
    .withCapabilities({ unexpectedAlertBehaviour: "accept" })
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  return driver;
}

module.exports = {
  downloadChromeDriver,
  openChromeSession,
  attachToSession,
};
