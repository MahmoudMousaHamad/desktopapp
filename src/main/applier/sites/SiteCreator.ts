/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import { WebDriver } from "selenium-webdriver";

import { QuestionInfo, QuestionsInfo } from "../jobapplication/Question";
import { Categorizer, Logger } from "../lib";
import {
	killDriverProcess,
	openChromeSession,
	attachToSession,
	Locator,
	Scripts,
	Helper,
} from "../driver";

import { Site, Status } from "./Site";

export default abstract class SiteCreator {
	questionsInfo: QuestionsInfo = {
		text: new QuestionInfo(
			"text",
			["input[type=text]", "input[type=tel]"],
			"label"
		),
		textarea: new QuestionInfo("textarea", "textarea", "label"),
		number: new QuestionInfo("number", "input[type=number]", "label"),
		date: new QuestionInfo("date", "input[type=date]", "label"),
		radio: new QuestionInfo(
			"radio",
			"input[type=radio]",
			"legend",
			".//label/input//.."
		),
		select: new QuestionInfo("select", "select", "label", ".//select/option"),
		checkbox: new QuestionInfo(
			"checkbox",
			"input[type=checkbox]",
			["label", "legend"],
			".//label/input//.."
		),
	};

	driver?: WebDriver;

	status: Status;

	constructor() {
		this.status = Status.STOPPED;
	}

	getQuestionsInfo(): QuestionsInfo {
		return this.questionsInfo;
	}

	public async start(): Promise<void> {
		await openChromeSession();
		this.status = Status.RUNNING;
		this.driver = await attachToSession();
		Helper.init(this.driver as WebDriver);
		const site = this.createSite(this.driver as WebDriver);
		await site.goToJobsPage();
		const locator = new Locator.Locator(this.driver as WebDriver, site);
		await locator.waitUntilSignIn();
		await this.run();
	}

	async stop() {
		Logger.info("Stopping bot 2");
		this.status = Status.STOPPED;
		await this.driver?.close();
		Categorizer.SingletonCategorizer.save();
		await killDriverProcess();
	}

	pause() {
		Logger.info("Pausing bot");
		this.status = Status.PAUSED;
	}

	async resume() {
		Logger.info("Resuming bot");
		this.status = Status.RUNNING;
		await this.run();
	}

	async restart() {
		this.pause();
		await this.resume();
	}

	getStatus() {
		return this.status;
	}

	public abstract createSite(driver: WebDriver): Site;

	public async run(): Promise<void> {
		const site = this.createSite(this.driver as WebDriver);
		const locator = new Locator.Locator(this.driver as WebDriver, site);
		await this.driver?.executeScript(Scripts.DoNotInteract);
		await this.driver?.sleep(5000);

		while (this.status === Status.RUNNING) {
			let locatorResult;
			try {
				locatorResult = await locator.getAction();
			} catch (e) {
				continue;
			}

			const { action, status, page } = locatorResult;

			if (status === "restart") {
				await this.restart();
			} else if (status === "success") {
				try {
					Logger.info(`Running action for ${page}`);
					await action();
					await Helper.checkTabs();
				} catch (e) {
					Logger.error(`Something went wrong while running action ${page}`);
					await new Promise<void>((resolve) => {
						setTimeout(async () => {
							try {
								await action();
								await Helper.checkTabs();
							} catch (e2) {
								Logger.error(
									`Something went wrong AGAIN while running action for ${page}, falling back`,
									e
								);
								Logger.info(`Status: ${this.status}`);
								if (this.status === Status.RUNNING) await site.goToJobsPage();
							}
							resolve();
						}, 5000);
					});
				}
			} else {
				await site.goToJobsPage();
			}
			await this.driver?.sleep(2000);
		}
	}
}
