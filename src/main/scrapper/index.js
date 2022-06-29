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
const Classifier = require("./Classifier");

class Scraper {
  constructor() {
    this.driver = undefined;
  }

  static Classifier = new Classifier();

  async start() {
    console.log("Starting bot");

    this.openSession();
    await this.attachToSession();

    this.locator = new Locator(this.driver);
    await this.locator.goToJobsPage();
    await this.run();
  }

  async stop() {
    console.log("Stopping bot");

    await this.driver.close();

    Scraper.Classifier.save(Classifier.CLASSIFIER_PATH, (err) => {
      if (err) {
        throw Error(err);
      } else {
        console.log("Classifier saved successfully.");
      }
    });
  }

  async run() {
    while (true) {
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
    }
  }

  openSession() {
    // Open chrome on specified port
    exec(
      'google-chrome --remote-debugging-port=9222 --user-data-dir="/home/mahmoud/userchromedata"',
      (error, stdout, stderr) => {
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
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
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  }
}

module.exports.Scraper = Scraper;
