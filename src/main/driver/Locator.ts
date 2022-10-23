/* eslint-disable no-await-in-loop */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-labels */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint global-require: off, no-console: off, promise/always-return: off */

import { WebDriver, until, By } from "selenium-webdriver";

import { PleaseSignIn } from "./DriverScripts";
import Logger from "../scrapper/Logger";
import { Site } from "./site/Site";

export const TITLE = "TITLE";
export const SOURCE = "SOURCE";

export class Locator {
	driver: WebDriver;

	site: Site;

	interval?: NodeJS.Timer;

	constructor(driver: WebDriver, site: Site) {
		this.driver = driver;
		this.site = site;
	}

	async getAction() {
		const pageTitle = await this.getTitle();
		const pageSource = await this.getPageSource();

		for (const key in this.site.locationsAndActions) {
			if (key in this.site.locationsAndActions) {
				const value = this.site.locationsAndActions[key];
				let string: string | undefined = "";
				try {
					string = value.type === TITLE ? pageTitle : pageSource;
				} catch (e) {
					Logger.error(
						"Something went wrong while getting the title or source of the page."
					);
					return { action: "restart", status: "failed" };
				}

				if (!string) {
					return { action: "goToJobsPage", status: "failed" };
					break;
				}

				if (
					value.strings.some((s: string) =>
						string?.toLowerCase().includes(s.toLowerCase())
					)
				) {
					return {
						action: value.action,
						status: "success",
						page: key,
					};
				}
			}
		}
		return {
			status: "not-found",
		};
	}

	async getTitle() {
		const title = await this.driver.getTitle();
		return title;
	}

	async getPageSource() {
		let source;

		try {
			source = await this.driver.getPageSource();
		} catch (e) {
			await this.site.goToJobsPage();
		}

		return source;
	}

	async signedIn() {
		return (
			(await this.driver.findElements(By.css(this.site.selectors.signedIn)))
				.length >= 1
		);
	}

	async waitUntilSignIn() {
		Logger.info("User signed in:", await this.signedIn());
		if (!(await this.signedIn())) {
			await this.driver.executeScript(PleaseSignIn);
			await new Promise<void>((resolve) => {
				this.interval = setInterval(async () => {
					if (await this.signedIn()) {
						Logger.info("User is signed in.");
						clearInterval(this.interval);
						resolve();
					}
				}, 1000);
			});
		}
	}

	async acceptAlert() {
		const alert = await this.driver.wait(until.alertIsPresent(), 2000);
		await alert?.accept();
	}

	async continueToApplication() {
		await this.continue();
	}

	async submitApplication() {
		await this.continue();
	}

	async continue() {
		await (
			await this.driver.findElement(By.css(this.site.selectors.nextButton))
		).click();
	}
}
