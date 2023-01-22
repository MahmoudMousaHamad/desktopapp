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

	site?: Site;

	locator?: Locator.Locator;

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
		this.site = this.createSite(this.driver as WebDriver);
		this.locator = new Locator.Locator(this.driver as WebDriver, this.site);
		await this.locator.waitUntilSignIn();
		while (this.status === Status.RUNNING) {
			try {
				await this.run();
			} catch (e) {
				Logger.error(
					`Something went wrong while running the current site ${e}`
				);
			}
		}
	}

	async stop() {
		try {
			this.status = Status.STOPPED;
			Categorizer.SingletonCategorizer.save();
			await this.driver?.close();
		} catch (e) {
			Logger.error(`Something went wrong while stopping ${e}`);
		}
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
		return {
			status: this.status,
			count: this.site?.count,
		};
	}

	getJobs() {
		return this.site?.jobs;
	}

	public abstract createSite(driver: WebDriver): Site;

	public async run(): Promise<void> {
		if (!this.locator || !this.site || !this.driver) {
			throw Error("Something went wrong while instantiating this site");
		}
		// await this.driver?.executeScript(Scripts.DoNotInteract);

		let previousPage;
		let actionStartDate = Date.now();

		while (this.status === Status.RUNNING) {
			let locatorResult;
			try {
				locatorResult = await this.locator.getAction();
			} catch (e) {
				continue;
			}

			const { action, status, page } = locatorResult;

			// a single submission should not take longer than one minute
			// a single action should not keep repeated for more than 30 seconds
			if (
				Date.now() - this.site.currentJobStartDate > 6e4 ||
				(Date.now() - actionStartDate > 3e4 && previousPage === page)
			) {
				await this.site?.goToJobsPage();
			}

			if (status === "success") {
				actionStartDate = Date.now();
				try {
					Logger.info(`Running action for ${page}`);
					await action();
					await Helper.checkTabs();
				} catch (e) {
					Logger.error(`Something went wrong while running action for ${page}`);
					try {
						await action();
						await Helper.checkTabs();
					} catch (e2) {
						Logger.error(
							`Something went wrong AGAIN while running action for ${page}, falling back`,
							e
						);
						Logger.info(`Status: ${this.status}`);
						if (this.status === Status.RUNNING) await this.site?.goToJobsPage();
					}
				}
			} else if (status === "restart") await this.restart();
			else await this.site?.goToJobsPage();
			await this.driver?.sleep(2000);
			previousPage = page;
		}
	}
}
