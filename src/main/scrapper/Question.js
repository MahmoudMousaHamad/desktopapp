/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
require("chromedriver");
const { By, Key, promise } = require("selenium-webdriver");
const natural = require("natural");

const Classifier = require("./Classifier");
const { categorize, SingletonCategorizer } = require("./Categorizer");
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
				optionsXpath: "//label/input//..",
			},
			answer: async (_elements, answer) => {
				/**
				 * Expects a string literal
				 * Falls back to the first option
				 */
				const options = await this.element.findElements(
					By.xpath("//label/input//..")
				);
				for (let i = 0; i < options.length; ++i) {
					if (answer.includes(await options[i].getText())) {
						await options[i].click();
						return;
					}
				}
				// Fallback
				console.log("Radio question is falling back...");
				await options[0].click();
			},
		},
		select: {
			selectors: {
				text: ["label"],
				input: ["select"],
				options: ["option"],
				optionsXpath: "//select/option",
			},
			answer: async (_element, answer) => {
				/**
				 * Expects a string of the text of one of the options
				 * Falls back to the first option
				 */
				const element = this.element.findElement(By.css("select"));
				await element.sendKeys(answer);
				// await element.click();
				// const options = await element.findElements(By.css("option"));
				// for (let i = 0; i < options.length; ++i) {
				// 	if (answer.includes(await options[i].getText())) {
				// 		await options[i].click();
				// 		console.log("Clicked correct option");
				// 		return;
				// 	}
				// }
				// // Fallback
				// console.log("Checkbox falling back and answer was:", answer);
				// await options[0].click();
			},
		},
		checkbox: {
			selectors: {
				text: ["legend", "label"],
				input: ["input[type=checkbox]"],
				options: ["label"],
				optionsXpath: "//label/input//..",
			},
			answer: async (_elements, answer) => {
				/**
				 * Expects answer to be an array of strings
				 */
				const options = await this.element.findElements(
					By.xpath("//label/input//..")
				);
				console.log(
					"Attempting to fillout checkboxes. Attempting answer of index ",
					answer
				);
				// Uncheck any checked boxes
				for (let i = 0; i < options.length; ++i) {
					if (await options[i].isSelected()) {
						await options[i].click();
					}
				}

				if (options.length === 1) {
					await options[0].click();
					return;
				}
				if (Array.isArray(answer)) {
					for (let i = 0; i < options.length; ++i) {
						if (answer.includes(await options[i].getText())) {
							await options[i].click();
						}
					}
					// for (let i = 0; i < options.length; ++i) {
					// 	if (answer.includes(i)) {
					// 		await options[i].click();
					// 	}
					// }
					return;
				}
				for (let i = 0; i < options.length; ++i) {
					if (i === answer) {
						await options[i].click();
						return;
					}
				}
				await options[0].click();
			},
		},
		// fallback: {
		//   selectors: {
		//     text: ["label"],
		//     input: ["input"],
		//   },
		//   answer: async (_element, answer) => {
		//     const element = await this.element.findElement(By.css("input"));
		//     await this.clearInput(element);
		//     await element.sendKeys(answer);
		//   },
		// },
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
		// Questions that have options will expect an index number
		console.log("Question type: ", this.type);
		await this.typesSelectors[this.type].answer(this.inputElement, answer);
	}

	async attemptToAnswer() {
		console.log("Attempting to answer question: ", this.text);

		let attemptedAnswer = null;

		console.log("Attempting to categorize question and answer it.");
		const { category, score, answer, type } = SingletonCategorizer.categorize(
			this.questionTokens
		);
		console.log("Question category:", category, "Score:", score, "Type:", type);
		if (score > 0 && this.type === type) {
			console.log("Answering question using category", answer);
			attemptedAnswer = answer;
		} else {
			console.log(
				"Attempting to answer question using classifier with tokens: ",
				this.questionTokens
			);
			const classifications = Classifier.SingletonClassifier.getClassifications(
				this.questionTokens
			);
			if (classifications.length === 0) {
				console.log("No classification");
				return false;
			}
			const { label, value } = classifications[0];
			console.log("Highest confidence value: ", classifications[0]);
			attemptedAnswer = value > Classifier.CONDIFENCE_THRESHOLD ? label : null;
		}

		if (attemptedAnswer) {
			if (this.options !== "None") {
				if (this.type === "checkbox" && Array.isArray(attemptedAnswer)) {
					const temp = [];
					this.options.forEach((option, index) => {
						attemptedAnswer.some((a) => {
							const distance = natural.JaroWinklerDistance(
								option,
								a,
								undefined,
								true
							);
							if (distance > 0.9) {
								temp.push(index);
								return true;
							}
						});
					});
					if (temp.length === 0) return false;
					attemptedAnswer = temp;
				} else {
					// Go through options and see if the attempted answer makes sense
					let maxDistance = -100;
					let maxOption = "";
					this.options.forEach((option, index) => {
						const distance = natural.JaroWinklerDistance(
							option,
							attemptedAnswer,
							undefined,
							true
						);
						if (
							distance > maxDistance ||
							option.toLowerCase().includes(attemptedAnswer.toLowerCase())
						) {
							maxDistance = distance;
							maxOption = option;
						}
					});
					if (maxDistance < 0.9 || maxOption === "") {
						return false;
					}
					attemptedAnswer = maxOption;
				}
			}

			console.log("Attempted answer: ", attemptedAnswer);

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
				selectors: { optionsXpath: optionsSelectors },
			} = this.typesSelectors[this.type];

			if (!optionsSelectors) {
				return "None";
			}

			const optionsElements = await this.element.findElements(
				By.xpath(optionsSelectors)
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
