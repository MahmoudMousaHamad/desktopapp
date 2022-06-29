const { By } = require("selenium-webdriver");
const { ipcMain } = require("electron");
const window = require("electron").BrowserWindow;

const { Question } = require("./Question");

class QAManager {
  constructor(driver, handleDone) {
    this.channels = { question: "question" };
    this.listeners = { answer: "answer" };
    [this.win] = window.getAllWindows();
    this.handleDone = handleDone;
    this.driver = driver;
    this.questions = [];
  }

  async startWorkflow() {
    // this.removeAllListeners();
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

    this.getNextQuestion();

    const questionAnswered = this.currentQuestion.attemptToAnswer();

    if (questionAnswered && !this.done) {
      this.getNextQuestion();
    } else if (this.done) {
      await this.clean();
      return;
    }

    this.win.webContents.send(this.channels.question, {
      question: await this.currentQuestion.abstract(),
      done: this.done,
    });
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
        await this.driver.sleep(1000);
        await this.sendNextQuestion();
      } else {
        await this.clean();
      }
    });
  }

  getNextQuestion() {
    this.currentQuestion = this.questions.at(this.currentIndex);
    this.done = this.currentIndex >= this.questions.length - 1;
    this.currentIndex += 1;
  }

  async clean() {
    this.lastQuestionAnswered = true;
    await this.handleDone();
  }
}

module.exports = QAManager;
