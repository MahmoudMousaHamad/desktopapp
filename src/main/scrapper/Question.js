/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
require("chromedriver");
const { By, Key, promise } = require("selenium-webdriver");
const natural = require("natural");
const { BrowserWindow } = require("electron");

const Scraper = require("./index");
const Classifier = require("./Classifier");
const { categorize, UserAnswersSingleton } = require("./Categories");

function filterInt(value) {
  if (/^[-+]?(\d+|Infinity)$/.test(value)) {
    return Number(value);
  }
  return NaN;
}

async function selectElement(elements, answer) {
  let maxJaroWinklerDistance = 0;
  let elementWithMax = null;
  for (const element of elements) {
    const elementText = await element.getText();
    console.log("Option Text: ", elementText);
    const distance = natural.JaroWinklerDistance(elementText, answer);
    if (distance > maxJaroWinklerDistance) {
      maxJaroWinklerDistance = distance;
      elementWithMax = element;
    }
  }

  if (elementWithMax) {
    await elementWithMax.click();
  } else {
    throw Error("Could not find answer among options", answer);
  }
}

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
        input: ["input[type=text]"],
      },
      answer: async (_element, answer) => {
        const element = await this.element.findElement(
          By.css("input[type=text]")
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
        text: ["legend"],
        input: ["input[type=checkbox]"],
        options: ["label"],
      },
      answer: async (_elements, answer) => {
        const elements = await this.element.findElements(By.css("label"));
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
    await this.typesSelectors[this.type].answer(this.inputElement, answer);
  }

  async attemptToAnswer() {
    let attemptedAnswer = null;

    console.log("Attempting to categorize question and answer it.");
    const { category, score } = categorize(this.questionText);
    console.log("Question category:", category, "Score", score);
    if (score > 0) {
      console.log("Answering question using category");
      attemptedAnswer = UserAnswersSingleton.userAnswers[category];
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
      if (this.options !== "None") {
        attemptedAnswer = this.mapAnswerToOption(attemptedAnswer);
        if (!attemptedAnswer) return false;
        console.log("Mapped answer:", attemptedAnswer);
      }
      await this.answer(attemptedAnswer);
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
