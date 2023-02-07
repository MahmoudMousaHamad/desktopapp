/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
import { BrowserWindow, ipcMain } from "electron";
import { By } from "selenium-webdriver";

import { SingletonCategorizer } from "../lib/Categorizer";
import Logger from "../lib/Logger";
import Question from "./Question";
import { Site } from "../sites";

const SEND_QUESTIONS = false;

class QAManager {
	site: Site;

	listeners: { [name: string]: string };

	channels: { [name: string]: string };

	questionsToSend: Question[];

	allQuestions: Question[];

	answeredLastQuestion: boolean;

	interval?: NodeJS.Timer;

	questionsSentDate: number;

	win: BrowserWindow;

	constructor(site: Site) {
		this.channels = {
			questions: "questions",
			clearQuestions: "clear-questions",
		};
		this.listeners = { answers: "answers" };
		[this.win] = BrowserWindow.getAllWindows();
		this.answeredLastQuestion = false;
		this.questionsSentDate = 0;
		this.questionsToSend = [];
		this.allQuestions = [];
		this.site = site;
	}

	async startWorkflow() {
		this.setupIPCListeners();

		const allQuestionsCool = await this.gatherQuestions();

		if (!allQuestionsCool) {
			await this.site.exitApplication();
			return;
		}

		const answeredAll = await this.attemptToAnswerQuestions();

		if (SEND_QUESTIONS) {
			if (this.questionsToSend.length > 0) {
				await this.sendQuestions();
				await this.waitUntilDone();
			} else {
				await this.site.handleDoneAnsweringQuestions();
			}
		} else if (answeredAll) await this.site.handleDoneAnsweringQuestions();
		else await this.site.exitApplication();
	}

	removeAllListeners() {
		Object.entries(this.listeners).forEach(([, value]) => {
			ipcMain.removeAllListeners(value);
		});
	}

	async waitUntilDone() {
		await new Promise<void>((resolve) => {
			this.interval = setInterval(async () => {
				if (this.answeredLastQuestion) {
					clearInterval(this.interval);
					resolve();
				}
				// else if (Date.now() - this.questionsSentDate >= 60000) {
				// 	Logger.info(
				// 		"Waiting for answers timed out, exiting job application..."
				// 	);
				// 	clearInterval(this.interval);
				// 	resolve();
				// 	this.win.webContents.send(this.channels.clearQuestions);
				// 	await this.forceQuit();
				// }
			}, 1000);
		});
	}

	async attemptToAnswerQuestions() {
		for (const question of this.allQuestions) {
			const questionPrepared = await question.prepare();
			if (!questionPrepared) continue;
			const answered = await question.attemptToAnswer();
			if (!answered) {
				if (SEND_QUESTIONS) this.questionsToSend.push(question);
				else return false;
			}
		}
		return true;
	}

	async sendQuestions() {
		this.questionsSentDate = Date.now();
		this.win.webContents.send(this.channels.questions, {
			questions: this.questionsToSend.map((question) => question.getInfo()),
		});
	}

	async gatherQuestions() {
		const questionsElements = await this.site.driver.findElements(
			Site.getBy(this.site.selectors.questions)
		);

		for (const qe of questionsElements) {
			const inputText = await qe.findElement(By.css("label,legend"));
			const text = await inputText.getText();
			if (!text.includes("optional")) {
				const question = new Question(qe, this.site);
				const coolQuestion = await question.prepare();
				if (!coolQuestion) {
					Logger.info(`Question could not be prepared ${await qe.getText()}`);
					return false;
				}
				this.allQuestions.push(question);
			}
		}

		return true;
	}

	setupIPCListeners() {
		ipcMain.on(this.listeners.answers, async (_event, { answers }) => {
			if (!this.questionsToSend) return;
			for (let i = 0; i < answers.length; i++) {
				const question = this.questionsToSend[i];
				if (!question) continue;
				const answer = answers[i];
				const { options, type } = question.getInfo();
				let clientAnswer = answer;

				if (options) {
					clientAnswer =
						type === "checkbox"
							? options.filter((_option: string, index: number) =>
									answer.includes(index)
							  )
							: options[answer];
				}

				Logger.info(`Answer as input to categorizer: ${clientAnswer}`);
				SingletonCategorizer.addCategory(question.tokens, clientAnswer, type);
				await question.answer(clientAnswer);
			}

			this.answeredLastQuestion = true;
			await this.clean();
		});
	}

	async clean() {
		this.removeAllListeners();
		await this.site.handleDoneAnsweringQuestions();
	}

	async forceQuit() {
		this.answeredLastQuestion = true;
		this.removeAllListeners();
		await this.site.exitApplication();
	}
}

export default QAManager;