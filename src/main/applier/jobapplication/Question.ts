/* eslint-disable max-classes-per-file */
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { By, promise, WebElement } from "selenium-webdriver";
import Natural from "natural";

import { Categorizer, Logger } from "../lib";
import { Helper } from "../driver";
import { Site } from "../sites";

require("chromedriver");

const SCORE_THRESHOLD = 1;

export enum QuestionTypes {
	textarea = "textarea",
	checkbox = "checkbox",
	select = "select",
	number = "number",
	radio = "radio",
	date = "date",
	text = "text",
}

export type QuestionsInfo = {
	[key in QuestionTypes]: QuestionInfo;
};

export class QuestionInfo {
	type: string;

	inputSelector: string[];

	textSelector: string[];

	optionsSelector: string | null;

	constructor(
		type: string,
		inputSelector: string[] | string,
		textSelector: string[] | string,
		optionsSelector: null | string = null
	) {
		this.type = type;
		this.inputSelector = Array.isArray(inputSelector)
			? inputSelector
			: [inputSelector];
		this.textSelector = Array.isArray(textSelector)
			? textSelector
			: [textSelector];
		this.optionsSelector = optionsSelector;
	}
}

class Question {
	element: WebElement;

	site: Site;

	type?: QuestionTypes | null;

	text: string | null;

	options: string[] | null;

	tokens?: string[];

	inputElement?: WebElement;

	constructor(element: WebElement, site: Site) {
		this.element = element;
		this.options = null;
		this.text = null;
		this.site = site;
	}

	answerFunctions: { [name: string]: any } = {
		text: async (answer: string, inputSelector: string) => {
			const input = await this.element.findElement(By.css(inputSelector));
			await Helper.clearInput(input);
			await input.sendKeys(answer);
		},
		textarea: async (answer: string, inputSelector: string) => {
			const input = await this.element.findElement(By.css(inputSelector));
			await Helper.clearInput(input);
			await input.sendKeys(answer);
		},
		number: async (answer: string, inputSelector: string) => {
			const element = await this.element.findElement(By.css(inputSelector));
			await Helper.clearInput(element);
			await element.sendKeys(answer);
		},
		date: async (answer: string, inputSelector: string) => {
			const element = await this.element.findElement(By.css(inputSelector));
			await Helper.clearInput(element);
			const [year, month, day] = answer.split("-");
			[month, day, year].forEach(async (part) => {
				await element.sendKeys(part);
			});
		},
		radio: async (
			answer: string,
			inputSelector: string,
			optionsSelector: string
		) => {
			const options = await this.element.findElements(
				By.xpath(optionsSelector)
			);
			for (let i = 0; i < options.length; ++i) {
				if (answer.includes(await options[i].getText())) {
					await options[i].click();
					return;
				}
			}
			Logger.info("Radio question is falling back...");
			await options[0].click();
		},
		select: async (answer: string, inputSelector: string) => {
			const element = this.element.findElement(By.css(inputSelector));
			await element.sendKeys(answer);
		},
		checkbox: async (
			answer: number | string[],
			inputSelector: string,
			optionsSelector: string
		) => {
			const options = await this.element.findElements(
				By.xpath(optionsSelector)
			);
			Logger.info(`${optionsSelector} ${inputSelector}`);
			const inputs = await this.element.findElements(By.xpath(inputSelector));
			console.log(options, inputs);
			// Uncheck any checked boxes
			for (let i = 0; i < options.length; ++i) {
				if (await inputs[i]?.isSelected()) {
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
	};

	async prepare(): Promise<boolean> {
		this.type = await this.getType();
		this.text = await this.getText();
		this.options = await this.getOptions();
		if (!(this.type && this.text)) {
			Logger.info(
				`Question type, text, and/or options is/are not defined. ${this.type} ${this.text}`
			);
			return false;
		}

		this.tokens = Categorizer.SingletonCategorizer.TokenizeQuestion(this.text);

		return true;
	}

	getInfo() {
		return {
			text: this.text,
			type: this.type,
			options: this.options,
		};
	}

	async answer(answer: string) {
		if (!this.type) throw Error("Type is not defined");
		Logger.info(`Question type: ${this.type}`);

		const { inputSelector, optionsSelector } =
			this.site.questionsInfo[this.type];
		Logger.info(
			`Inputting answer of value ${answer} and type ${typeof answer}
			for input with selector ${inputSelector} and ${optionsSelector}`
		);
		await this.answerFunctions[this.type as string](
			answer.toString(),
			inputSelector.join(","),
			optionsSelector
		);
	}

	async attemptToAnswer() {
		// If checkbox and only one option, select it
		if (
			this.type === "checkbox" &&
			this.options &&
			this.options?.length === 1
		) {
			this.answer(this.options[0]);
			return true;
		}
		Logger.info(`Attempting to answer question: ${this.text}`);

		let attemptedAnswer: any;

		Logger.info("Attempting to categorize question and answer it.");
		const { category, score, answer } =
			Categorizer.SingletonCategorizer.categorize(this.tokens, this.type);

		Logger.info(`Question category: ${category}, Score: ${score}`);
		if (score > SCORE_THRESHOLD) {
			Logger.info(`Answering question using category ${answer}`);
			attemptedAnswer = answer;
		}

		if (attemptedAnswer) {
			if (this.options) {
				if (this.type === "checkbox" && Array.isArray(attemptedAnswer)) {
					const temp: string[] = [];
					this.options.forEach((option) => {
						attemptedAnswer.every((a: string) => {
							const distance = Natural.JaroWinklerDistance(option, a);
							if (distance > 0.9) {
								temp.push(option);
								return true;
							}
							return false;
						});
					});
					if (temp.length === 0) return false;
					attemptedAnswer = temp;
				} else {
					// Go through options and see if the attempted answer makes sense
					let maxDistance = -Infinity;
					let maxOption = "";
					this.options.forEach((option) => {
						const distance = Natural.JaroWinklerDistance(
							option,
							attemptedAnswer
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
		} else if (
			this.type === QuestionTypes.text ||
			this.type === QuestionTypes.textarea
		)
			attemptedAnswer = "N/A";
		else if (this.type === QuestionTypes.number) attemptedAnswer = "0";
		else if (this.type === QuestionTypes.date) attemptedAnswer = "2020-01-01";
		else if (this.options && this.options?.length > 0)
			[, attemptedAnswer] = this.options;

		if (attemptedAnswer) {
			Logger.info(`Attempting answer with: ${attemptedAnswer}...`);
			await this.answer(attemptedAnswer);
			Logger.info("Question answered automatically");
			return true;
		}
		return false;
	}

	async getType(): Promise<QuestionTypes | null> {
		for (const enumVal of Object.values(QuestionTypes)) {
			const inputs = await this.element.findElements(
				By.css(this.site.questionsInfo[enumVal].inputSelector.join(","))
			);
			if (inputs.length >= 1) return enumVal;
		}
		return null;
	}

	/**
	 * @returns question text string
	 */
	async getText() {
		if (!this.type) return null;
		const textElement = await this.element.findElement(
			By.css(this.site.questionsInfo[this.type].textSelector.join(","))
		);
		const questionText = await textElement.getText();
		return questionText;
	}

	async getOptions(): Promise<any[] | null> {
		if (!this.type) {
			return null;
		}

		let options = [];
		try {
			const { optionsSelector } = this.site.questionsInfo[this.type];
			if (!optionsSelector) return null;

			const optionsElements = await this.element.findElements(
				By.xpath(optionsSelector)
			);

			options = await promise.map(optionsElements, async (element) => {
				const text = await element.getText();
				return text;
			});
		} catch (e) {
			Logger.error("ERROR: Couldn't get question options");
			return null;
		}
		if (options.length === 0) {
			Logger.info("This question has no options");
		}
		return options;
	}
}

export default Question;
