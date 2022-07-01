/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-labels */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint global-require: off, no-console: off, promise/always-return: off */

require("chromedriver");
const chrome = require("selenium-webdriver/chrome");
const { exec } = require("child_process");
const { Builder } = require("selenium-webdriver");

const { Locator, TITLE } = require("./Locator");
const { SingletonClassifier } = require("./Classifier");

class Scraper {
  constructor() {
    this.driver = undefined;
  }

  async start() {
    console.log("Starting bot");
    this.running = true;

    this.openSession();
    await this.attachToSession();

    this.locator = new Locator(this.driver);
    await this.locator.goToJobsPage();
    await this.run();
  }

  async stop() {
    console.log("Stopping bot");
    this.running = false;
    await this.driver.close();
    SingletonClassifier.save();
  }

  async run() {
    while (this.running) {
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
            console.log(e);
          }

          if (value.strings.some((s) => string.includes(s))) {
            try {
              console.log("Running action for", key);
              await value.action();
              await this.driver.sleep(1000);
            } catch (e) {
              await new Promise((resolve) => {
                setTimeout(async () => {
                  await value.action();
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
          if (stdout && stdout.includes("existing browser session")) {
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

  async attachToSession() {
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

module.exports.Scraper = Scraper;
