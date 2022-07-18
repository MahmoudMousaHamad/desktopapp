/* eslint-disable no-await-in-loop */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-labels */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint global-require: off, no-console: off, promise/always-return: off */

const { By, Key, until } = require("selenium-webdriver");
const window = require("electron").BrowserWindow;

const Preferences = require("./UserPrefernces");
const Classifier = require("./Classifier");
const QAManager = require("./QAManager");

const TITLE = "TITLE";
const SOURCE = "SOURCE";

class Locator {
	constructor(driver) {
		this.driver = driver;
	}

	locationsAndActions = {
		jobs: {
			strings: ["Job Search", "Jobs, Employment", "Flexible"],
			type: TITLE,
			action: this.goToNextAvailableJob.bind(this),
		},
		resume: {
			strings: ["Add a resume"],
			type: SOURCE,
			action: this.resumeSection.bind(this),
		},
		questions: {
			strings: ["Questions from"],
			type: SOURCE,
			action: this.answerQuestions.bind(this),
		},
		experience: {
			strings: ["Select a past job that shows relevant experience"],
			type: SOURCE,
			action: this.chooseExperience.bind(this),
		},
		letter: {
			strings: [
				"Want to include any supporting documents?",
				"requests a cover letter for this application",
				"Consider adding supporting documents",
			],
			type: SOURCE,
			action: this.chooseLetter.bind(this),
		},
		missingQualifications: {
			strings: [
				"is looking for these qualifications",
				"Do you have these qualifications from the job description?",
			],
			type: SOURCE,
			action: this.continueToApplication.bind(this),
		},
		submit: {
			strings: [
				"Review the contents of this job application",
				"Please review your application",
			],
			type: TITLE,
			action: this.submitApplication.bind(this),
		},
		submitted: {
			strings: ["Your application has been submitted!", "One more step"],
			type: SOURCE,
			action: async () => {
				window.getAllWindows()[0].webContents.send("application-submitted");
				await this.goToJobsPage();
			},
		},
	};

	async getTitle() {
		const title = await this.driver.getTitle();
		return title;
	}

	async getPageSource() {
		let source;

		try {
			source = await this.driver.getPageSource();
		} catch (e) {
			await this.goToJobsPage();
			// console.error(e);
			// return null;
		}

		return source;
	}

	async signedIn() {
		return (await this.driver.findElements(By.css("#AccountMenu"))).length >= 1;
	}

	async waitUntilSignIn() {
		console.log("User signed in:", await this.signedIn());
		if (!(await this.signedIn())) {
			await this.driver.executeScript(
				"alert('Please sign into Indeed to get started.')"
			);
			await new Promise((resolve) => {
				this.interval = setInterval(async () => {
					if (await this.signedIn()) {
						console.log("User is signed in.");
						clearInterval(this.interval);
						resolve();
					}
				}, 1000);
			});
		}
	}

	async resumeSection() {
		await this.scroll();
		await this.driver.sleep(1000);
		await this.continue();
	}

	async goToNextAvailableJob() {
		if (!(await this.waitFor(By.css("#vjs-container-iframe"), 10))) {
			this.goToJobsPage();
		}

		const cards = await this.driver.findElements(By.className("cardOutline"));

		for (const card of cards) {
			await this.driver.switchTo().defaultContent();

			try {
				if ((await card.getText()).includes("Applied")) continue;
			} catch (e) {
				continue;
			}

			await card.click();

			await this.driver.sleep(2500);

			await this.driver
				.switchTo()
				.frame(await this.driver.findElement(By.css("#vjs-container-iframe")));
			if (
				(await this.driver.findElements(By.id("indeedApplyButton"))).length > 0
			) {
				try {
					await this.driver.findElement(By.id("indeedApplyButton")).click();
					const tabs = await this.driver.getAllWindowHandles();
					if (tabs.length === 2) {
						await this.driver.switchTo().window(tabs[0]);
						await this.driver.close();
						await this.driver.switchTo().window(tabs[1]);
					}
				} catch (e) {
					await this.driver.switchTo().defaultContent();
					continue;
				}
				break;
			}
		}

		await this.driver.switchTo().defaultContent();
	}

	async goToJobsPage() {
		const location =
			Preferences.locations[
				Math.floor(Math.random() * Preferences.locations.length)
			];

		const title =
			Preferences.titles[Math.floor(Math.random() * Preferences.titles.length)];

		this.driver.get(
			`https://www.indeed.com/jobs?q=${title}&l=${location}&sc=0kf%3Aexplvl(${Preferences.experienceLevel})jt(${Preferences.jobType})%3B&from=smart-apply&vjk=fcc224d605e356c1`
		);
	}

	async answerQuestions() {
		const qaManager = new QAManager(
			this.driver,
			this.handleDoneAnsweringQuestions.bind(this)
		);

		await qaManager.startWorkflow(async () => {
			await this.goToJobsPage();
			await this.driver.sleep(2000);
			const alert = await this.driver.wait(until.alertIsPresent(), 2000);
			await alert?.accept();
		});
	}

	async handleDoneAnsweringQuestions() {
		await this.continue();
		// Retrain classifier after we finish answering the questions
		Classifier.SingletonClassifier.retrain();

		// await this.driver.sleep(1000);
		// if (
		//   await this.driver
		//     .getPageSource()
		//     .toLowerCase()
		//     .includes("answer this question to continue")
		// ) {
		//   await this.goToJobsPage();
		// } else {
		// }
	}

	async chooseExperience() {
		await this.driver.sleep(1000);
		await this.continue();
	}

	async chooseLetter() {
		try {
			await (
				await this.driver.findElements(By.css("div.css-kyg8or"))
			)[3].click();
		} catch (e) {
			console.error(e);
		}
		await this.driver.sleep(1000);
		if (Preferences?.coverLetter && Preferences?.coverLetter !== "") {
			const textarea = await this.driver.findElement(By.css("textarea"));
			await this.driver.executeScript((element) => element.select(), textarea);
			await textarea.sendKeys(Key.BACK_SPACE);
			await textarea.sendKeys(Preferences.coverLetter);
		}
		await this.driver.sleep(1000);
		await this.continue();
	}

	async continueToApplication() {
		await this.continue();
	}

	async submitApplication() {
		await this.continue();
	}

	async waitFor(locator, timeout = 10) {
		try {
			const el = await this.driver.findElement(locator);
			await this.driver.wait(
				until.elementIsVisible(el),
				timeout,
				`Couldn't find ${locator}`
			);
		} catch (e) {
			console.log(`Could not find element ${locator}`);
			return false;
		}

		return true;
	}

	async scroll() {
		await this.driver.executeScript(
			"window.scrollTo(0, document.body.scrollHeight);"
		);
	}

	async continue() {
		await (
			await this.driver.findElement(By.className("ia-continueButton"))
		).click();
	}
}

module.exports = {
	Locator,
	TITLE,
	SOURCE,
};
