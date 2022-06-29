/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
require("chromedriver");
const { By, Key, promise } = require("selenium-webdriver");
const { Scraper } = require(".");
const Classifier = require("./Classifier");

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
        await elements.forEach(async (element, index) => {
          console.log("Answer, index: ", answer, index);
          if (index === parseInt(answer, 10)) {
            console.log("Found answer");
            element.click();
          }
        });
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
        await elements.forEach(async (element, index) => {
          if (answer.includes(index.toString())) {
            await element.click();
          }
        });
      },
    },
  };

  /**
   * Convert the question to an object
   */
  async abstract() {
    const type = await this.getQuestionType();
    const text = await this.getQuestionText();
    const options = await this.getQuestionOptions();

    if (!(options && type && text)) {
      return null;
    }

    return {
      text,
      type,
      options,
    };
  }

  async answer(answer) {
    await this.typesSelectors[this.type].answer(this.inputElement, answer);
  }

  async attemptToAnswer() {
    const { text, type, options } = await this.abstract();

    const questionTokens = Classifier.TokenizeQuestion(text);

    const classifications =
      Scraper.Classifier.getClassifications(questionTokens);

    if (classifications.length === 0) {
      return null;
    }

    const { label, value } = classifications[0];

    return value > Classifier.CONDIFENCE_THRESHHOLD ? label : null;
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
