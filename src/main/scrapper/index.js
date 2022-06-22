/* eslint-disable no-labels */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint global-require: off, no-console: off, promise/always-return: off */

require("chromedriver");
const chrome = require("selenium-webdriver/chrome");
const { exec } = require("child_process");
const { Builder, By, until } = require("selenium-webdriver");
const window = require("electron").BrowserWindow;
const { ipcMain } = require("electron");

const { locations } = require("./locations");
const { Question } = require("./Question");

class Scraper {
  constructor() {
    this.driver = undefined;
  }

  async start() {
    console.log("Starting bot");

    this.openSession();
    await this.attachToSession();

    await this.goToJobsPage();

    await this.run();
  }

  async run() {
    const locator = {
      jobs: {
        strings: ["Job Search", "Jobs, Employment", "Flexible"],
        type: "TITLE",
        action: this.goToNextAvailableJob.bind(this),
      },
      resume: {
        strings: ["Add a resume"],
        type: "SOURCE",
        action: this.resumeSection.bind(this),
      },
      questions: {
        strings: ["Questions from"],
        type: "SOURCE",
        action: this.answerQuestions.bind(this),
      },
      experience: {
        strings: [
          "Select a past job that shows relevant experience",
          // "Graduate Research Assistant",
        ],
        type: "SOURCE",
        action: this.chooseExperience.bind(this),
      },
      letter: {
        strings: [
          "Want to include any supporting documents?",
          "requests a cover letter for this application",
        ],
        type: "SOURCE",
        action: this.chooseLetter.bind(this),
      },
      missingQualifications: {
        strings: [
          "is looking for these qualifications",
          "Do you have these qualifications from the job description?",
        ],
        type: "SOURCE",
        action: this.continueToApplication.bind(this),
      },
      jobSearch: {
        strings: ["submitted"],
        type: "TITLE",
        action: this.goToJobsPage.bind(this),
      },
      submit: {
        strings: ["Review the contents of this job application"],
        type: "TITLE",
        action: this.continue.bind(this),
      },
    };

    while (true) {
      for (const key in locator) {
        if (key in locator) {
          const value = locator[key];
          let string = "";
          try {
            string =
              value.type === "TITLE"
                ? await this.driver.getTitle()
                : await this.driver.getPageSource();
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

  async resumeSection() {
    await this.scroll();
    await this.driver.sleep(5000);
    await this.continue();
  }

  async goToNextAvailableJob() {
    if (!(await this.waitFor(By.css("#vjs-container-iframe"), 10))) {
      this.goToJobsPage();
    }

    const cards = await this.driver.findElements(By.className("cardOutline"));

    for (const card of cards) {
      await this.driver.switchTo().defaultContent();

      try {
        if ((await card.getText()).includes("Applied")) continue;
      } catch (e) {
        continue;
      }

      await card.click();

      await this.driver.sleep(5000);

      await this.driver
        .switchTo()
        .frame(this.driver.findElement(By.css("#vjs-container-iframe")));
      if (
        (await this.driver.findElements(By.id("indeedApplyButton"))).length > 0
      ) {
        try {
          await this.driver.findElement(By.id("indeedApplyButton")).click();
        } catch (e) {
          await this.driver.switchTo().defaultContent();
          continue;
        }
        break;
      }
    }

    await this.driver.switchTo().defaultContent();
  }

  async goToJobsPage() {
    const location = locations[Math.floor(Math.random() * locations.length)];
    this.driver.get(
      `https://www.indeed.com/jobs?q=software%20developer&l=${location}&sc=0kf%3Aexplvl(ENTRY_LEVEL)jt(fulltime)%3B&from=smart-apply&vjk=fcc224d605e356c1`
    );
  }

  async answerQuestions() {
    // Get all questions
    // Abstract and decompose question into parts
    // Send question data to mobile phone and renderer
    // Wait for answer
    // Fill in answer on the site
    // Repeat
    ipcMain.removeAllListeners("question");
    ipcMain.removeAllListeners("answer");

    // Get all questions
    const questionsElements = await this.driver.findElements(
      By.css(".ia-Questions-item")
    );

    const questions = [];

    for (const qe of questionsElements) {
      const question = await new Question(qe).abstract();
      console.log(question);
      if (!question) continue;
      questions.push(question);
    }

    console.log(questions);

    const questionsHTMLIterator = questions.values();
    let next = questionsHTMLIterator.next();

    const win = window.getAllWindows()[0];

    win.webContents.send("question", {
      question: next.value,
      last: next.done,
    });

    ipcMain.on("answer", async (event, { answer, last }) => {
      // Process answer
      console.log("ANSWER: ", answer);
      console.log("Last: ", last);

      if (next.done) {
        this.lastQuestionAnswered = true;
      }

      if (!next.done) {
        // Send next question
        next = questionsHTMLIterator.next();
        win.webContents.send("question", {
          question: next.value,
          last: next.done,
        });
      }
    });

    win.webContents.send("question", {
      question: next.value,
      last: next.done,
    });

    await new Promise((resolve) => {
      this.interval = setInterval(() => {
        if (this.lastQuestionAnswered) {
          console.log("Last question was answered!");
          this.lastQuestionAnswered = null;
          clearInterval(this.interval);
          resolve();
        }
      }, 1000);
    });
  }

  async chooseExperience() {
    const experiences = await this.driver.findElements(
      By.className("css-4l8g94")
    );
    if (experiences.length === 4) {
      await experiences[2].click();
    }
    await this.driver.sleep(5000);
    await this.continue();
  }

  async chooseLetter() {
    try {
      await (
        await this.driver.findElements(By.css("div.css-kyg8or"))
      )[3].click();
    } catch (e) {
      console.error(e);
    }
    await this.driver.sleep(5000);
    await this.continue();
  }

  async continueToApplication() {
    await this.continue();
  }

  async submitApplication() {
    await (
      await this.driver.findElement(By.id("returnToSearchButton"))
    ).click();
    await this.driver.sleep(5000);
  }

  async waitFor(locator, timeout = 10) {
    try {
      const el = await this.driver.findElement(locator);
      await this.driver.wait(
        until.elementIsVisible(el),
        timeout,
        `Couldn't find ${locator}`
      );
    } catch (e) {
      console.log(`Could not find element ${locator}`);
      return false;
    }

    return true;
  }

  async scroll() {
    await this.driver.executeScript(
      "window.scrollTo(0, document.body.scrollHeight);"
    );
  }

  async continue() {
    await this.driver.findElement(By.className("ia-continueButton")).click();
  }

  // eslint-disable-next-line class-methods-use-this
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
