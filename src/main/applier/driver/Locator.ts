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

export const ELEMENT = "ELEMENT";
export const SOURCE = "SOURCE";
export const XPATH = "XPATH";
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

	async captia(): Promise<void> {
		// Wait for user to load
		Logger.info("Waiting for user to load");
		// Display VerifyHuman script
		Logger.info("Displaying VerifyHuman script");
		await this.driver.executeScript(PleaseSignIn);
		// Wait for user to complete the captcha
		Logger.info("Waiting for user to complete the captcha");
		await this.driver.wait(async () => {
			const title = await this.driver.getTitle();
			return title !== "Just a moment...";
		}, 1000 * 60 * 5);
		// Refresh the page
		Logger.info("Refreshing the page");
		await this.driver.navigate().refresh();
	}

	async getAction() {
		// Check if the page is the Cloudflare page by chacking if the title is "Just a moment..."
		if ((await this.driver.getTitle()) === "Just a moment...") {
			return {
				action: this.captia.bind(this),
				status: "success",
				page: "Cloudflare",
			};
		}
		for (const [key, value] of Object.entries(this.site.locationsAndActions)) {
			let string: string | undefined = "";
			try {
				if (value.type === TITLE) string = await this.getTitle();
				else if (value.type === SOURCE) string = await this.getPageSource();
				else if (value.type === TEXT)
					string = await (
						await this.driver.findElement(By.css("body"))
					).getText();
				else if (value.type === XPATH) {
					const elements = await this.driver.findElements(
						By.xpath(value.strings.join("|"))
					);
					if (elements.length > 0) {
						return {
							action: value.action,
							status: "success",
							page: key,
						};
					}
				} else if (value.type === ELEMENT) {
					const elements = await this.driver.findElements(
						By.css(value.strings.join(","))
					);
					if (elements.length > 0) {
						return {
							action: value.action,
							status: "success",
							page: key,
						};
					}
				} else string = await this.driver.getCurrentUrl();
			} catch (e) {
				Logger.error(
					"Something went wrong while getting the title or source of the page."
				);
				return { action: this.site.goToJobsPage, status: "failed" };
			}

			if (!string) continue;

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
			(await this.driver.findElements(Site.getBy(this.site.selectors.signedIn)))
				.length > 0
		);
	}

	async waitUntilSignIn() {
		await this.driver.get(this.site.jobsURL);
		await this.driver.sleep(1000);
		// Check if there is a captcha
		const title = await this.driver.getTitle();
		if (title === "Just a moment...") {
			await this.captia();
		}
		const signedin = await this.signedIn();
		if (signedin) {
			Logger.info("User is signed in");
		} else {
			// wait for 5s to see if the user will be logged in automatically
			Logger.info("User is not signed in");
			await this.driver.executeScript(PleaseSignIn);
			await new Promise<void>((resolve) => {
				this.interval = setInterval(async () => {
					if (await this.signedIn()) {
						Logger.info("User just signed in.");
						clearInterval(this.interval);
						resolve();
					}
				}, 1000);
			});
		}
	}
}
