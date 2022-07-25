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
		await this.injectBanner();

		await this.driver.sleep(5000);

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
		}
	}

	async injectBanner() {
		await this.driver.executeScript(
			`
				function htmlToElement(html) {
					var template = document.createElement('template');
					html = html.trim();
					template.innerHTML = html;
					return template.content.firstChild;
				}
				document.body.prepend(htmlToElement(
					\`
					<div id="jobapplier-modal" class="jobapplier-modal">
						<div id="jobapplier-modal-content">
							<span class="jobapplier-close">&times;</span>
							<p style="font-size: 20px;">Message from JobApplier</p>
							<p style="font-size: 15px;">
							This window is controlled by JobApplier.
							Please close this and do not interact with this chrome window.
							If anything goes wrong, restart the app and let us know what went wrong
							so that we can fix it. email: mahmoudmousahamad@gmail.com
							</p>
						</div>
					</div>
					\`
				));
				var modal = document.getElementById("jobapplier-modal");
				modal.style = \`
					position: fixed;
					z-index: 1000;
					left: 0;
					top: 0;
					width: 100%;
					height: 100%;
					overflow: auto;
					background-color: rgb(0,0,0);
					background-color: rgba(0,0,0,0.4);
				\`
				document.getElementById("jobapplier-modal-content").style = \`
					background-color: #fefefe;
					margin: 15% auto;
					padding: 20px;
					border: 1px solid #888;
					width: 30%;
				\`
				var span = document.getElementsByClassName("jobapplier-close")[0];
				span.style = \`
					color: #aaa;
					float: right;
					font-size: 28px;
					font-weight: bold;
					cursor: pointer;
				\`
				span.onclick = function() {
					modal.style.display = "none";
				}
		`
		);
	}
}

module.exports = {
	Scraper,
};
