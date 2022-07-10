/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
require("chromedriver");
const { By, Key, promise } = require("selenium-webdriver");
const natural = require("natural");

const Classifier = require("./Classifier");
const { categorize } = require("./Categorizer");
const Preferences = require("./UserPrefernces");

class Question {
  constructor(element) {
    this.element = element;
  }

  async clearInput(element) {
    const inputValueLength = (await element.getAttribute("value")).length;
    await (await element.getDriver()).executeScript((e) => e.select(), element);
    for (let i = 0; i < inputValueLength; i++) {
      await element.sendKeys(Key.BACK_SPACE);
    }
  }

  typesSelectors = {
    text: {
      selectors: {
        text: ["label"],
        input: ["input[type=text]", "input[type=tel]"],
      },
      answer: async (_element, answer) => {
        const element = await this.element.findElement(
          By.css("input[type=text], input[type=tel]")
        );
        await this.clearInput(element);
        await element.sendKeys(answer);
      },
    },
    textarea: {
      selectors: {
        text: ["label"],
        input: ["textarea"],
      },
      answer: async (_element, answer) => {
        const element = await this.element.findElement(By.css("textarea"));
        await this.clearInput(element);
        await element.sendKeys(answer);
      },
    },
    number: {
      selectors: {
        text: ["label"],
        input: ["input[type=number]"],
      },
      answer: async (_element, answer) => {
        const element = await this.element.findElement(
          By.css("input[type=number]")
        );
        await this.clearInput(element);
        await element.sendKeys(answer);
      },
    },
    date: {
      selectors: {
        text: ["label"],
        input: ["input[type=date]"],
      },
      answer: async (_element, answer) => {
        const element = await this.element.findElement(
          By.css("input[type=date]")
        );
        await this.clearInput(element);
        const [year, month, day] = answer.split("-");
        [month, day, year].forEach(async (part) => {
          await element.sendKeys(part);
        });
      },
    },
    radio: {
      selectors: {
        text: ["legend"],
        input: ["input[type=radio]"],
        options: ["label"],
      },
      answer: async (_elements, answer) => {
        const elements = await this.element.findElements(By.css("label"));
        for (const option of elements) {
          const text = await option.getText();
          if (text === answer) {
            await option.click();
            return;
          }
        }
        await elements[0].click();
      },
    },
    select: {
      selectors: {
        text: ["label"],
        input: ["select"],
        options: ["option"],
      },
      answer: async (_element, answer) => {
        const element = this.element.findElement(By.css("select"));
        await element.click();
        const options = await element.findElements(By.css("option"));
        for (const option of options) {
          const text = await option.getText();
          if (text === answer) {
            await option.click();
            return;
          }
        }
        await options[0].click();
      },
    },
    checkbox: {
      selectors: {
        text: ["legend", "label"],
        input: ["input[type=checkbox]"],
        options: ["label"],
      },
      answer: async (_elements, answer) => {
        const elements = await this.element.findElements(By.css("label"));
        console.log(
          "Attempting to fillout checkboxes. Attempting answer: ",
          answer
        );
        if (elements.length === 1) {
          await elements[0].click();
          return;
        }
        if (Array.isArray(answer)) {
          for (const option of elements) {
            const text = await option.getText();
            if (answer.includes(text)) {
              await option.click();
            }
          }
          return;
        }
        for (const option of elements) {
          const text = await option.getText();
          if (text === answer) {
            await option.click();
            return;
          }
        }
        await elements[0].click();
      },
    },
    fallback: {
      selectors: {
        text: ["label"],
        input: ["input"],
      },
      answer: async (_element, answer) => {
        const element = await this.element.findElement(By.css("input"));
        await this.clearInput(element);
        await element.sendKeys(answer);
      },
    },
  };

  async prepare() {
    this.type = await this.getQuestionType();
    this.text = await this.getQuestionText();
    this.options = await this.getQuestionOptions();
    if (!(this.type && this.text && this.options)) {
      console.log(
        "Question type, text, and/or options is/are not defined.",
        this.type,
        this.text,
        this.options
      );
      return false;
    }

    this.questionTokens = Classifier.TokenizeQuestion(this.text);

    return true;
  }

  /**
   * Convert the question to an object
   */
  abstract() {
    return {
      text: this.text,
      type: this.type,
      options: this.options,
    };
  }

  mapAnswerToOption(answer) {
    if (this.options === "None") throw Error("No options to map answer to");
    let max = 0;
    let maxOption;
    for (const option of this.options) {
      const distance = natural.JaroWinklerDistance(option, answer);
      if (distance > max) {
        max = distance;
        maxOption = option;
      }
    }

    return maxOption;
  }

  async answer(answer) {
    console.log("Question type: ", this.type);
    await this.typesSelectors[this.type].answer(this.inputElement, answer);
  }

  async attemptToAnswer() {
    console.log("Attempting to answer question: ", this.text);

    let attemptedAnswer = null;

    console.log("Attempting to categorize question and answer it.");
    const { category, score } = categorize(this.questionText);
    console.log("Question category:", category, "Score", score);
    if (score > 0) {
      console.log("Answering question using category");
      attemptedAnswer = Preferences.answers[category];
    } else {
      console.log(
        "Attempting to answer question using classifier with tokens: ",
        this.questionTokens
      );
      const classifications = Classifier.SingletonClassifier.getClassifications(
        this.questionTokens
      );
      if (classifications.length === 0) {
        console.log("No classifications");
        return false;
      }
      const { label, value } = classifications[0];
      console.log("Highest confidence value: ", classifications[0]);
      attemptedAnswer = value > Classifier.CONDIFENCE_THRESHOLD ? label : null;
    }

    if (attemptedAnswer) {
      console.log("Attempted answer: ", attemptedAnswer);
      if (this.options !== "None") {
        attemptedAnswer = this.mapAnswerToOption(attemptedAnswer);
        if (!attemptedAnswer) return false;
        console.log("Mapped answer:", attemptedAnswer);
      }
      await this.answer(attemptedAnswer);
      console.log("Question answered automatically");
      return true;
    }

    return false;
  }

  async getQuestionType() {
    for (const type in this.typesSelectors) {
      const {
        selectors: { input: inputSelectors },
      } = this.typesSelectors[type];

      const inputs = await this.element.findElements(
        By.css(inputSelectors.join(","))
      );

      if (inputs.length >= 1) {
        this.type = type;
        this.inputElement = inputs;
        this.inputsLength = inputs.length;
        return type;
      }
    }

    return null;
  }

  /**
   * @returns question text string
   */
  async getQuestionText() {
    if (!this.type) {
      return null;
    }
    const {
      selectors: { text: textSelectors },
    } = this.typesSelectors[this.type];

    // TODO: checkboxes not working:
    // Unable to locate element: {"method":"css selector","selector":"legend"}
    const textElement = await this.element.findElement(
      By.css(textSelectors.join(","))
    );
    const questionText = await textElement.getText();
    this.questionText = questionText;
    return questionText;
  }

  async getQuestionOptions() {
    if (!this.type) {
      return null;
    }

    let options = [];
    try {
      const {
        selectors: { options: optionsSelectors },
      } = this.typesSelectors[this.type];

      if (!optionsSelectors) {
        return "None";
      }

      const optionsElements = await this.element.findElements(
        By.css(optionsSelectors.join(","))
      );

      options = promise.map(optionsElements, async (element) => {
        const text = await element.getText();
        return text;
      });
    } catch (e) {
      console.log("ERROR: Couldn't get question options", this);
      return null;
    }

    return options;
  }
}

module.exports = {
  Question,
};
