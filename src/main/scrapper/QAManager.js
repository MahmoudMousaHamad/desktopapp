const { By } = require("selenium-webdriver");
const { ipcMain } = require("electron");
const window = require("electron").BrowserWindow;

const { Question } = require("./Question");

class QAManager {
  constructor(driver, handleDone) {
    this.driver = driver;
    this.handleDone = handleDone;
    this.questions = [];
    this.listeners = { answer: "answer" };
    this.channels = { question: "question" };
    [this.win] = window.getAllWindows();
  }

  async startWorkflow() {
    this.removeAllListeners();
    await this.gatherQuestions();
    await this.setupIPCListeners();
    await this.sendNextQuestion();

    await this.waitUntilDone();
  }

  removeAllListeners() {
    Object.entries(this.listeners).forEach(([, value]) => {
      ipcMain.removeAllListeners(value);
    });
  }

  async waitUntilDone() {
    await new Promise((resolve) => {
      this.interval = setInterval(async () => {
        if (this.lastQuestionAnswered) {
          clearInterval(this.interval);
          resolve();
        }
      }, 1000);
    });
  }

  async sendNextQuestion() {
    if (this.done) {
      throw Error("No more questions to send");
    }

    this.currentQuestion = this.questions.at(this.currentIndex);
    this.done = this.currentIndex >= this.questions.length - 1;

    this.win.webContents.send(this.channels.question, {
      question: await this.currentQuestion.abstract(),
      done: this.done,
    });

    this.currentIndex += 1;
  }

  async gatherQuestions() {
    const questionsElements = await this.driver.findElements(
      By.css(".ia-Questions-item")
    );

    questionsElements.forEach((qe) => {
      this.questions.push(new Question(qe));
    });

    this.currentIndex = 0;
  }

  setupIPCListeners() {
    ipcMain.on(this.listeners.answer, async (event, { answer }) => {
      await this.currentQuestion.answer(answer);
      if (!this.done) {
        await this.sendNextQuestion();
      } else {
        this.lastQuestionAnswered = true;
        await this.handleDone();
      }
    });
  }
}

module.exports = QAManager;
