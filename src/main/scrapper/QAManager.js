/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
const window = require("electron").BrowserWindow;
const { By } = require("selenium-webdriver");
const { ipcMain } = require("electron");

const { SingletonCategorizer } = require("./Categorizer");
const { default: Logger } = require("./Logger");
const { Question } = require("./Question");

class QAManager {
	constructor(driver, handleDone, fallback) {
		this.channels = { question: "question", questions: "questions" };
		this.listeners = { answer: "answer", answers: "answers" };
		[this.win] = window.getAllWindows();
		this.handleDone = handleDone;
		this.fallback = fallback;
		this.driver = driver;
		this.questions = [];
	}

	async startWorkflow() {
		this.setupIPCListeners();

		const allQuestionsCool = await this.gatherQuestions();

		if (!allQuestionsCool) {
			await this.fallback();
			return;
		}

		await this.attemptToAnswerQuestions();

		if (this.clientQuestions.length > 0) {
			// await this.sendNextQuestion();
			await this.sendQuestions();
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
				} else if (new Date() - this.questionSentDate >= 60000) {
					Logger.info("Waiting for answer timed out, exiting application...");
					clearInterval(this.interval);
					resolve();
					await this.forceQuit();
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
				Logger.info("Question answering attempt successful.");
				await this.driver.sleep(500);
			} else {
				this.clientQuestions.push(question);
			}
		}
	}

	async sendQuestions() {
		this.questionsSentDate = new Date();
		this.win.webContents.send(this.channels.questions, {
			questions: this.clientQuestions.map((question) => question.abstract()),
		});
	}

	async sendNextQuestion() {
		if (this.qnaOver()) {
			throw Error("No more questions to send");
		}

		this.questionSentDate = new Date();

		if (!(await this.getNextQuestion())) {
			await this.forceQuit();
			return;
		}

		Logger.info("Sending question to client", this.currentQuestion.abstract());

		this.win.webContents.send(this.channels.question, {
			question: this.currentQuestion.abstract(),
			lastQuestion: this.qnaOver(),
		});

		if (this.qnaOver()) {
			Logger.info("Done: cleaning");
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
				"//*[(self::input or self::textarea or self::select)]/ancestor::*/preceding-sibling::label/..//label[not(./input)]/.. | //legend/.."
			)
		);

		for (const qe of questionsElements) {
			const inputText = await qe.findElement(By.xpath("./label | ./legend"));
			const text = await inputText.getText();
			if (!text.includes("(optional)")) {
				const question = new Question(qe);
				const coolQuestion = await question.prepare();
				if (!coolQuestion) {
					Logger.info("Question could not be prepared", await qe.getText());
					return false;
				}
				this.questions.push(question);
			}
		}
		this.currentIndex = 0;

		return true;
	}

	setupIPCListeners() {
		ipcMain.on(this.listeners.answers, async (event, { answers }) => {
			if (!this.clientQuestions) {
				return;
			}
			for (let i = 0; i < answers.length; i++) {
				const question = this.clientQuestions[i];
				const answer = answers[i];
				const { options, type } = question.abstract();
				let clientAnswer = answer;

				if (options !== "None") {
					clientAnswer =
						type === "checkbox"
							? options.filter((option, index) => answer.includes(index))
							: options[answer];
				}

				Logger.info("Answer as input to categorizer: ", clientAnswer);

				SingletonCategorizer.addCategory(
					question.questionTokens,
					clientAnswer,
					type
				);

				await question.answer(clientAnswer);
			}

			this.lastQuestionAnswered = true;
			await this.clean();
		});

		ipcMain.on(this.listeners.answer, async (event, { answer }) => {
			if (!this.currentQuestion) return;

			/**
			 * Remember that answer from clients is expected to be:
			 * - An array of integers if checkbox
			 * - A string if text input
			 * - An integer if select
			 * - An integer if radio
			 */
			Logger.info("Answer as recieved from client: ", answer);

			const { type, options } = this.currentQuestion.abstract();

			// Answer as input to categorizer
			let modifiedAnswer = answer;

			if (options !== "None") {
				modifiedAnswer =
					type === "checkbox"
						? options.filter((option, index) => answer.includes(index))
						: options[answer];
			}

			Logger.info(
				"Answer as input to classifier/categorizer: ",
				modifiedAnswer
			);

			SingletonCategorizer.addCategory(
				this.currentQuestion.questionTokens,
				modifiedAnswer,
				this.currentQuestion.type
			);

			await this.currentQuestion.answer(modifiedAnswer);

			this.lastQuestionAnswered =
				this.currentIndex >= this.clientQuestions.length;

			if (this.qnaOver()) {
				this.lastQuestionAnswered = true;
				await this.clean();
			} else {
				await this.driver.sleep(500);
				await this.sendNextQuestion();
			}
		});
	}

	async getNextQuestion() {
		this.currentQuestion = this.clientQuestions.at(this.currentIndex);
		this.currentIndex += 1;

		if (!(await this.currentQuestion?.prepare()) && !this.qnaOver()) {
			// await this.getNextQuestion();
			return false;
		}

		return true;
	}

	qnaOver() {
		return (
			this.currentIndex >= this.clientQuestions.length &&
			this.lastQuestionAnswered
		);
	}

	internalClean() {
		this.removeAllListeners();
	}

	async clean() {
		this.internalClean();
		await this.handleDone();
	}

	async forceQuit() {
		this.lastQuestionAnswered = true;
		await this.fallback();
		this.internalClean();
	}
}

module.exports = QAManager;
