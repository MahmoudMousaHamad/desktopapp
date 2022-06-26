/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
require("chromedriver");
const { By, promise } = require("selenium-webdriver");

class Question {
  constructor(element) {
    this.element = element;
  }

  typesSelectors = {
    text: {
      selectors: ["input[type=text]"],
      answer: async (element, answer) => {
        await element.sendKeys(answer);
      },
    },
    textarea: {
      selectors: ["textarea"],
      answer: async (element, answer) => {
        await element.sendKeys(answer);
      },
    },
    number: {
      selectors: ["input[type=number]"],
      answer: async (element, answer) => {
        await element.sendKeys(answer);
      },
    },
    radio: {
      selectors: ["input[type=radio]"],
      answer: async (elements, answer) => {
        await elements.forEach(async (element) => {
          const elementText = await element.getText();
          if (elementText === answer) {
            element.click();
          }
        });
      },
    },
    select: {
      selectors: ["select"],
      answer: async (element, answer) => {
        await element.click();
        const options = await element.findElements(By.css("option"));
        for (const option of options) {
          const optionText = await option.getText();
          if (optionText === answer) {
            await option.click();
            return true;
          }
        }
        return false;
      },
    },
    checkbox: {
      selectors: ["input[type=checkbox]"],
      answer: async (elements, answer) => {
        await elements.forEach(async (element, index) => {
          if (answer.includes(index)) {
            await element.click();
          }
        });
      },
    },
  };

  async answer(answer) {
    await this.typesSelectors[this.type].answer(this.inputElement, answer);
  }

  async getQuestionType() {
    for (const type in this.typesSelectors) {
      const { selectors } = this.typesSelectors[type];
      const possibleInputs = await this.element.findElements(
        By.css(selectors.join(","))
      );
      if (possibleInputs.length >= 1) {
        this.type = type;
        this.inputElement = possibleInputs;
        this.inputsLength = possibleInputs.length;
        return type;
      }
    }

    return null;
  }

  /**
   * Convert the question to an object
   */
  async abstract() {
    // Get question text
    // Get question type
    const text = await this.getQuestionText();
    const type = await this.getQuestionType();
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

  /**
   * Get all the label elements in the question and return the first label,
   * which probably contains that question text.
   * @returns question text string
   */
  async getQuestionText() {
    const labels = await this.element.findElements(By.css("label"));

    const questionText = await labels[0].getText();

    this.questionText = questionText;
    return questionText;
  }

  async getQuestionOptions() {
    let options = [];
    try {
      const { selectors } = this.typesSelectors[this.type];
      const optionsElements = await this.element.findElements(
        By.css(selectors.join(","))
      );
      if (this.inputsLength > 1) {
        options = promise.map(optionsElements, async (e) => {
          const text = await (await e.findElement(By.xpath("./.."))).getText();
          return text;
        });
      } else if (this.inputsLength === 1) {
        if (this.type === "select") {
          options = promise.map(optionsElements, async (e) => {
            const text = await e.getAttribute("label");
            return text;
          });
        } else {
          options = "None";
        }
      }
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
