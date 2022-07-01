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
const { categorize } = require("./Categories");

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
        if (Number.isNaN(filterInt(answer))) {
          console.log("Attempting to use classifier's answer");
          await selectElement(elements, answer);
        } else {
          await elements.forEach(async (element, index) => {
            if (index === parseInt(answer, 10)) {
              await element.click();
            }
          });
        }
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
        if (Number.isNaN(filterInt(answer))) {
          console.log("Attempting to use classifier's answer");
          await selectElement(options, answer);
          return true;
        }
        for (let i = 0; i < options.length; i++) {
          if (i === parseInt(answer, 10)) {
            await options[i].click();
            await element.sendKeys(Key.ESCAPE);
            return true;
          }
        }
        return false;
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
        if (Number.isNaN(filterInt(answer))) {
          await selectElement(elements, answer);
        }
        await elements.forEach(async (element, index) => {
          if (answer.includes(index.toString())) {
            await element.click();
          }
        });
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

  async answer(answer) {
    await this.typesSelectors[this.type].answer(this.inputElement, answer);
  }

  async attemptToAnswer() {
    console.log("Attempting to categorize question and answer it.");

    const { category, score } = categorize(this.questionText);
    console.log("Question category:", category, "Score", score);

    // if (score > 0) {
    // }

    console.log("Attempting to answer question: ", this.questionTokens);

    const classifications = Classifier.SingletonClassifier.getClassifications(
      this.questionTokens
    );

    console.log("Classifications: ", classifications);

    if (classifications.length === 0) {
      return null;
    }

    const { label, value } = classifications[0];

    console.log("Highest confidence value: ", classifications[0]);

    const attemptedAnswer =
      value > Classifier.CONDIFENCE_THRESHOLD ? label : null;

    if (attemptedAnswer) {
      console.log(
        "Attempted answer is above threshold: ",
        attemptedAnswer,
        value
      );

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
