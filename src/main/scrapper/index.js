/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
require("chromedriver");

const { Locator, TITLE } = require("./Locator");
const { SingletonClassifier } = require("./Classifier");
const { openChromeSession, attachToSession } = require("./DriverManager");

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
			for (const key in this.locator.locationsAndActions) {
				if (key in this.locator.locationsAndActions) {
					const value = this.locator.locationsAndActions[key];
					let string = "";
					try {
						string =
							value.type === TITLE
								? await this.locator.getTitle()
								: await this.locator.getPageSource();
					} catch (e) {
						console.error(e);
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
							await this.driver.sleep(1000);
						} catch (e) {
							await new Promise((resolve) => {
								setTimeout(async () => {
									try {
										await value.action();
									} catch (e2) {
										console.error(e2);
										await this.locator.goToJobsPage();
									}
									resolve();
								}, 5000);
							});
						}
					}
				}
			}
			await this.locator.goToJobsPage();
		}
	}
}

module.exports = {
	Scraper,
};
