/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
const window = require("electron").BrowserWindow;
const { By } = require("selenium-webdriver");
const { ipcMain } = require("electron");

const { SingletonClassifier } = require("./Classifier");
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

  async startWorkflow(fallback) {
    this.setupIPCListeners();

    const allQuestionsCool = await this.gatherQuestions();
    if (!allQuestionsCool) {
      await fallback();
      return;
    }

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
        console.log("Question answering attempt successful.");
        await this.driver.sleep(1000);
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
    const questionsElements = await this.driver.findElements(
      By.xpath(
        "//*[(self::input or self::textarea or self::select)]/ancestor::*/preceding-sibling::label/.. | //legend/.."
      )
    );

    for (const qe of questionsElements) {
      const inputText = await qe.findElement(By.xpath("./label | ./legend"));
      const text = await inputText.getText();
      if (!text.includes("(optional)")) {
        const question = new Question(qe);
        const coolQuestion = await question.prepare();
        if (!coolQuestion) {
          console.log("Question could not be prepared", await qe.getText());
          return false;
        }
        this.questions.push(question);
      }
    }
    this.currentIndex = 0;

    return true;
  }

  setupIPCListeners() {
    ipcMain.on(this.listeners.answer, async (event, { answer }) => {
      console.log("Answer as recieved from client: ", answer);

      const { type, options } = this.currentQuestion.abstract();
      let classifierAnswer = answer;

      if (options !== "None") {
        classifierAnswer =
          type === "checkbox"
            ? options
                .filter((option, index) => answer.includes(index))
                .join(" ")
            : (classifierAnswer = options[answer]);
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
