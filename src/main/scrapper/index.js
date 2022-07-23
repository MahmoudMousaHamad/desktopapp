/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
require("chromedriver");

const { openChromeSession, attachToSession } = require("./DriverManager");
const { SingletonClassifier } = require("./Classifier");
const { Locator, TITLE } = require("./Locator");
const { SingletonCategorizer } = require("./Categorizer");

class Scraper {
	constructor() {
		this.driver = undefined;
		this.running = null;
	}

	async start() {
		console.log("Starting bot");
		this.running = "running";

		openChromeSession();
		this.driver = await attachToSession();

		this.locator = new Locator(this.driver);
		await this.locator.goToJobsPage();
		await this.locator.waitUntilSignIn();
		await this.run();
	}

	async stop() {
		console.log("Stopping bot");
		this.running = "stopped";
		await this.driver.close();
		SingletonClassifier.save();
		SingletonCategorizer.save();
	}

	pause() {
		console.log("Pausing bot");
		this.running = "paused";
	}

	async resume() {
		console.log("Resuming bot");
		this.running = "running";
		await this.run();
	}

	getStatus() {
		return this.running;
	}

	async run() {
		while (this.running === "running") {
			await this.driver.sleep(2000);
			const pageTitle = await this.locator.getTitle();
			const pageSource = await this.locator.getPageSource();
			for (const key in this.locator.locationsAndActions) {
				if (key in this.locator.locationsAndActions) {
					const value = this.locator.locationsAndActions[key];
					let string = "";
					try {
						string = value.type === TITLE ? pageTitle : pageSource;
					} catch (e) {
						console.error(
							"Something went wrong while getting the title or source of the page, restarting applier engine."
						);
						this.pause();
						await this.resume();
					}

					if (!string) {
						await this.locator.goToJobsPage();
						break;
					}

					if (
						value.strings.some((s) =>
							string.toLowerCase().includes(s.toLowerCase())
						)
					) {
						try {
							console.log("Running action for", key);
							await value.action();
							await this.locator.checkTabs();
						} catch (e) {
							console.error(
								`Something went wrong while running action ${key}, trying again in 5 seconds`,
								e
							);
							await new Promise((resolve) => {
								setTimeout(async () => {
									try {
										await value.action();
										await this.locator.checkTabs();
									} catch (e2) {
										console.error(e2);
										await this.locator.goToJobsPage();
									}
									resolve();
								}, 5000);
							});
						}
						break;
					}
				}
			}
			// await this.locator.goToJobsPage();
		}
	}
}

module.exports = {
	Scraper,
};
