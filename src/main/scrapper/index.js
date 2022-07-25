/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
require("chromedriver");

const {
	openChromeSession,
	attachToSession,
	killDriverProcess,
} = require("./DriverManager");
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

		killDriverProcess();
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

	async restart() {
		this.pause();
		await this.resume();
	}

	getStatus() {
		return this.running;
	}

	async run() {
		while (this.running === "running") {
			await this.driver.sleep(2000);
			let locatorResult;
			try {
				locatorResult = await this.locator.getAction();
			} catch (e) {
				continue;
			}

			const { action, fallbackAction, status, page } = locatorResult;

			if (action === "restart") {
				await this.restart();
			} else if (status === "success") {
				try {
					console.log("Running action for", page);
					await action();
					await this.locator.checkTabs();
				} catch (e) {
					console.error(
						`Something went wrong while running action ${page},
						trying again in 5 seconds`,
						e
					);
					await new Promise((resolve) => {
						setTimeout(async () => {
							try {
								await action();
								await this.locator.checkTabs();
							} catch (e2) {
								console.error(
									`Something went wrong AGAIN while running action for ${page}, falling back`,
									e
								);
								await this.stop();
								await this.start();
							}
							resolve();
						}, 5000);
					});
				}
			} else if (status === "not-found") {
				await action();
			} else {
				await fallbackAction();
			}
		}
	}
}

module.exports = {
	Scraper,
};
