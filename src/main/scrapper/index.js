/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
require("chromedriver");

const {
	openChromeSession,
	attachToSession,
	killDriverProcess,
} = require("./DriverManager");
const { Locator } = require("./Locator");
const { SingletonCategorizer } = require("./Categorizer");
const { DoNotInteract } = require("./DriverScripts");
const { default: Logger } = require("./Logger");

class Scraper {
	constructor() {
		this.driver = undefined;
		this.running = null;
	}

	async start() {
		Logger.info("Starting bot");
		this.running = "running";

		openChromeSession();
		this.driver = await attachToSession();

		this.locator = new Locator(this.driver);

		await this.locator.goToJobsPage();
		await this.locator.waitUntilSignIn();

		await this.run();
	}

	async stop() {
		Logger.info("Stopping bot");
		this.running = "stopped";
		await this.driver.close();
		SingletonCategorizer.save();

		killDriverProcess();
	}

	pause() {
		Logger.info("Pausing bot");
		this.running = "paused";
	}

	async resume() {
		Logger.info("Resuming bot");
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
		await this.driver.executeScript(DoNotInteract);
		await this.driver.sleep(5000);

		while (this.running === "running") {
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
					Logger.info("Running action for", page);
					await action();
					await this.locator.checkTabs();
				} catch (e) {
					Logger.error(
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
								Logger.error(
									`Something went wrong AGAIN while running action for ${page}, falling back`,
									e
								);
								await fallbackAction();
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
			await this.driver.sleep(2000);
		}
	}
}

module.exports = {
	Scraper,
};
