/* eslint-disable import/no-named-as-default */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { WebDriver, By, Key } from "selenium-webdriver";
import { BrowserWindow } from "electron";

import { CoverLetter, Job, QnAManager } from "../jobapplication";
import { SingletonPreferences, Logger } from "../lib";
import { Helper, Locator } from "../driver";

import SiteCreator from "./SiteCreator";
import { Site } from "./Site";

interface JobSearchParams {
	experience: string;
	location: string;
	title: string;
	type: string;
}

const { SOURCE, TITLE } = Locator;

export class IndeedSite implements Site {
	submittedDate?: Date;

	driver: WebDriver;

	selectors: { [name: string]: string };

	job?: Job;

	jobSearchParams?: JobSearchParams;

	locationsAndActions = {
		jobs: {
			strings: ["Job Search", "Jobs, Employment", "Flexible"],
			type: TITLE,
			action: this.enterApplication.bind(this),
		},
		resume: {
			strings: ["Add a resume"],
			type: SOURCE,
			action: this.resumeSection.bind(this),
		},
		questions: {
			strings: ["answer", "questions"],
			type: TITLE,
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
				BrowserWindow.getAllWindows()[0].webContents.send(
					"application-submitted"
				);
				await this.goToJobsPage();
				this.submittedDate = new Date();
			},
		},
	};

	constructor(driver: WebDriver, selectors: any) {
		this.selectors = selectors;
		this.driver = driver;
	}

	async goToJobsPage(): Promise<void> {
		const location =
			SingletonPreferences.locations[
				Math.floor(Math.random() * SingletonPreferences.locations.length)
			];

		const title =
			SingletonPreferences.titles[
				Math.floor(Math.random() * SingletonPreferences.titles.length)
			];

		this.jobSearchParams = {
			experience: SingletonPreferences.experienceLevel,
			type: SingletonPreferences.jobType,
			location,
			title,
		};

		this.driver.get(
			`https://www.indeed.com/jobs?q=${title}&l=${location}&sc=0kf%3Aexplvl(${SingletonPreferences.experienceLevel})jt(${SingletonPreferences.jobType})`
		);
	}

	async enterApplication() {
		let applyNowPressed = false;

		await this.driver.sleep(5000);

		const cards = await this.driver.findElements(
			By.css(this.selectors.smallJobCard)
		);

		for (const card of cards) {
			await this.driver.switchTo().defaultContent();

			try {
				if ((await card.getText()).includes("Applied")) continue;
			} catch (e) {
				continue;
			}

			await card.click();

			await this.driver.sleep(2500);

			const iframe = await this.driver.findElements(
				By.css(this.selectors.bigJobCard)
			);

			if (iframe.length > 0) {
				await this.driver.switchTo().frame(iframe[0]);
			}

			if (
				(await this.driver.findElements(By.css(this.selectors.applyButton)))
					.length > 0
			) {
				try {
					await this.driver
						.findElement(By.css(this.selectors.applyButton))
						.click();
					await Helper.checkTabs();
				} catch (e) {
					await this.driver.switchTo().defaultContent();
					continue;
				}
				applyNowPressed = true;
				break;
			}
		}

		await this.driver.switchTo().defaultContent();

		if (!applyNowPressed) await this.goToJobsPage();
	}

	async resumeSection() {
		await this.getJobInfo();
		await Helper.scroll();
		await this.driver.sleep(1000);
		await this.continue();
	}

	async getJobInfo(): Promise<void> {
		const company = await Helper.getText(".ia-JobHeader-information span");
		const position = await Helper.getText(".ia-JobHeader-information h2");

		console.log("Job info:", position, company);

		this.job = new Job(
			position,
			company,
			"no-description",
			this.jobSearchParams?.title as string
		);
	}

	async answerQuestions() {
		const qaManager = new QnAManager(
			this.driver,
			this.handleDoneAnsweringQuestions.bind(this),
			this.exitApplication.bind(this)
		);
		await qaManager.startWorkflow();
	}

	async exitApplication() {
		await this.goToJobsPage();
		await this.driver.sleep(1000);
		await Helper.acceptAlert();
	}

	async handleDoneAnsweringQuestions() {
		await this.continue();
		if (
			(await this.driver.findElements(By.xpath(this.selectors.errorsXpath)))
				.length > 0
		) {
			await this.exitApplication();
		}
	}

	async chooseExperience() {
		await this.driver.sleep(1000);
		await this.continue();
	}

	async chooseLetter() {
		try {
			await (
				await this.driver.findElements(By.css(this.selectors.coverLetter))
			)[3].click();
		} catch (e) {
			Logger.error(e);
		}
		await this.driver.sleep(1000);
		if (
			SingletonPreferences?.coverLetter &&
			SingletonPreferences?.coverLetter !== ""
		) {
			const textarea = await this.driver.findElement(
				By.css(this.selectors.textarea)
			);
			await this.driver.executeScript(
				(element: any) => element.select(),
				textarea
			);
			await textarea.sendKeys(Key.BACK_SPACE);

			const coverLetter = new CoverLetter(
				SingletonPreferences,
				textarea,
				this.job as Job
			);
			await coverLetter.fill();
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

	async continue() {
		await (
			await this.driver.findElement(By.css(this.selectors.nextButton))
		).click();
	}
}

export class IndeedSiteCreator extends SiteCreator {
	public factoryMethod(driver: WebDriver): Site {
		const selectors = {
			errorsXpath: "//div[@class='css-mllman e1wnkr790']",
			bigJobCard: "#vjs-container-iframe",
			applyButton: ".ia-IndeedApplyButton",
			nextButton: ".ia-continueButton",
			coverLetter: "div.css-kyg8or",
			smallJobCard: ".cardOutline",
			signedIn: "#AccountMenu",
			textarea: "textarea",
		};
		return new IndeedSite(driver, selectors);
	}
}
