/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */

import { WebDriver } from "selenium-webdriver";

import { Categorizer, Logger } from "../lib";
import {
	Scripts,
	attachToSession,
	killDriverProcess,
	openChromeSession,
	Locator,
	Helper,
} from "../driver";

import { Site, Status } from "./Site";

export default abstract class SiteCreator {
	driver?: WebDriver;

	status: Status;

	constructor() {
		this.status = Status.STOPPED;
	}

	public async start(): Promise<void> {
		openChromeSession();
		this.status = Status.RUNNING;
		this.driver = attachToSession();
		Helper.init(this.driver);
		const site = this.factoryMethod(this.driver);
		await site.goToJobsPage();
		const locator = new Locator.Locator(this.driver as WebDriver, site);
		await locator.waitUntilSignIn();
		await this.run();
	}

	async stop() {
		Logger.info("Stopping bot");
		this.status = Status.STOPPED;
		await this.driver?.close();
		Categorizer.SingletonCategorizer.save();

		killDriverProcess();
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

	public abstract factoryMethod(driver: WebDriver): Site;

	public async run(): Promise<void> {
		const site = this.factoryMethod(this.driver as WebDriver);
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
								await site.goToJobsPage();
							}
							resolve();
						}, 5000);
					});
				}
			} else if (status === "not-found") {
				await site.goToJobsPage();
			} else {
				await site.goToJobsPage();
			}
			await this.driver?.sleep(2000);
		}
	}
}
