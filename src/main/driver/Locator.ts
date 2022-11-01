/* eslint-disable no-await-in-loop */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-labels */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint global-require: off, no-console: off, promise/always-return: off */

import { WebDriver, By } from "selenium-webdriver";

import Logger from "../lib/Logger";
import { Site } from "../sites";

import { PleaseSignIn } from "./Scripts";

export const SOURCE = "SOURCE";
export const TITLE = "TITLE";
export const TEXT = "TEXT";
export const URL = "URL";

export class Locator {
	driver: WebDriver;

	site: Site;

	interval?: NodeJS.Timer;

	constructor(driver: WebDriver, site: Site) {
		this.driver = driver;
		this.site = site;
	}

	async getAction() {
		const pageSource = await this.getPageSource();
		const pageTitle = await this.getTitle();

		for (const [key, value] of Object.entries(this.site.locationsAndActions)) {
			let string: string | undefined = "";
			try {
				if (value.type === TITLE) string = pageTitle;
				else if (value.type === SOURCE) string = pageSource;
				else if (value.type === TEXT)
					string = await (
						await this.driver.findElement(By.css("body"))
					).getText();
				else string = await this.driver.getCurrentUrl();
			} catch (e) {
				Logger.error(
					"Something went wrong while getting the title or source of the page."
				);
				return { action: this.site.goToJobsPage, status: "failed" };
			}

			if (!string) return { action: this.site.goToJobsPage, status: "failed" };

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
		return {
			action: this.site.goToJobsPage,
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
}
