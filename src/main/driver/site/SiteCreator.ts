/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */

import { WebDriver } from "selenium-webdriver";
import { SingletonCategorizer } from "../../scrapper/Categorizer";
import { DoNotInteract } from "../DriverScripts";
import Logger from "../../scrapper/Logger";
import {
	attachToSession,
	killDriverProcess,
	openChromeSession,
} from "../DriverManager";

import { Locator } from "../Locator";
import { Site, Status } from "./Site";
import Helper from "../Helper";

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
		await this.run(site);
	}

	async stop() {
		Logger.info("Stopping bot");
		this.status = Status.STOPPED;
		await this.driver?.close();
		SingletonCategorizer.save();

		killDriverProcess();
	}

	pause() {
		Logger.info("Pausing bot");
		this.status = Status.PAUSED;
	}

	async resume() {
		Logger.info("Resuming bot");
		this.status = Status.RUNNING;
		// TODO: await this.run();
	}

	async restart() {
		this.pause();
		await this.resume();
	}

	public abstract factoryMethod(driver: WebDriver): Site;

	public async run(site: Site): Promise<void> {
		const locator = new Locator(this.driver as WebDriver, site);
		await this.driver?.executeScript(DoNotInteract);
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
