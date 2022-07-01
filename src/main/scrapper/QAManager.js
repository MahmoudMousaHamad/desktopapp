/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
const { By } = require("selenium-webdriver");
const { ipcMain } = require("electron");
const window = require("electron").BrowserWindow;

const { Question } = require("./Question");
const Scraper = require("./index");
const { SingletonClassifier } = require("./Classifier");

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
    this.setupIPCListeners();

    await this.gatherQuestions();
    await this.attemptToAnswerQuestions();

    if (this.clientQuestions.length > 0) {
      await this.sendNextQuestion();
      await this.waitUntilDone();
    } else {
      await this.handleDone();
    }
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

  async attemptToAnswerQuestions() {
    this.clientQuestions = [];

    for (const question of this.questions) {
      const questionPrepared = await question.prepare();
      if (!questionPrepared) continue;
      const answered = await question.attemptToAnswer();
      if (answered) {
        console.log("Clasifier answered question.");
      } else {
        this.clientQuestions.push(question);
      }
    }
  }

  async sendNextQuestion() {
    if (this.qnaOver()) {
      throw Error("No more questions to send");
    }

    await this.getNextQuestion();

    console.log("Sending question to client", this.currentQuestion.abstract());

    this.win.webContents.send(this.channels.question, {
      question: this.currentQuestion.abstract(),
      lastQuestion: this.qnaOver(),
    });

    if (this.qnaOver()) {
      console.log("Done: cleaning");
      await this.clean();
    }
  }

  async getQuestionText(element) {
    const text = await element.getText();
    if (text.length > 0) {
      return text;
    }

    const parent = await element.findElement(By.xpath("./.."));
    return await this.getQuestionText(parent);
  }

  async gatherQuestions() {
    // const inputs = await this.driver.findElements(
    //   By.css("textarea, input, select")
    // );

    // for (const input of inputs) {
    //   const text = await this.getQuestionText(input);
    //   console.log("Question Text: ", text);
    // }

    const questionsElements = await this.driver.findElements(
      By.css(".ia-Questions-item")
    );

    for (const qe of questionsElements) {
      const elementText = await qe.getText();
      if (!elementText.includes("(optional)")) {
        this.questions.push(new Question(qe));
      }
    }
    this.currentIndex = 0;
  }

  setupIPCListeners() {
    ipcMain.on(this.listeners.answer, async (event, { answer, question }) => {
      console.log("Answer as recieved from client: ", answer);
      let classifierAnswer = answer;
      if (question.options !== "None") {
        if (question.type === "checkbox") {
          classifierAnswer = question.options.filter((option, index) =>
            answer.includes(index.toString())
          );
        } else {
          classifierAnswer = question.options[parseInt(answer, 10)];
        }
      }

      console.log("Answer as input to classifier: ", classifierAnswer);

      SingletonClassifier.addDocument(
        this.currentQuestion.questionTokens,
        classifierAnswer
      );

      await this.currentQuestion.answer(answer);

      this.lastQuestionAnswered =
        this.currentIndex >= this.clientQuestions.length;

      if (this.qnaOver()) {
        this.lastQuestionAnswered = true;
        await this.clean();
      } else {
        await this.driver.sleep(1000);
        await this.sendNextQuestion();
      }
    });
  }

  async getNextQuestion() {
    this.currentQuestion = this.clientQuestions.at(this.currentIndex);
    this.currentIndex += 1;

    if (!(await this.currentQuestion.prepare()) && !this.qnaOver()) {
      await this.getNextQuestion();
    }
  }

  qnaOver() {
    return (
      this.currentIndex >= this.clientQuestions.length &&
      this.lastQuestionAnswered
    );
  }

  async clean() {
    await this.handleDone();
  }
}

module.exports = QAManager;
