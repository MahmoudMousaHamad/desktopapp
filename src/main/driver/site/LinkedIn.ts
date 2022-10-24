/* eslint-disable import/no-named-as-default */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { WebDriver, By, Key } from "selenium-webdriver";
import { BrowserWindow } from "electron";

import CoverLetter from "../../scrapper/CoverLetter";
import Preferences from "../../scrapper/Preferences";
import QAManager from "../../scrapper/QAManager";
import { TITLE, SOURCE, URL } from "../Locator";
import Logger from "../../scrapper/Logger";
import Job from "../../scrapper/Job";
import Helper from "../Helper";

import SiteCreator from "./SiteCreator";
import { Site } from "./Site";

interface JobSearchParams {
	[name: string]: {
		value: string;
		name: string;
	};
}

export class LinkedInSite implements Site {
	submittedDate?: Date;

	driver: WebDriver;

	selectors: { [name: string]: string };

	job?: Job;

	jobSearchParams?: JobSearchParams;

	locationsAndActions = {
		jobs: {
			strings: ["/jobs/search/"],
			type: URL,
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
			strings: ["Submit application"],
			type: SOURCE,
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
		const LinkedInSearchParamsMapper: {
			[name: string]: { [name: string]: string };
		} = {
			type: {
				internship: "I",
				fulltime: "F",
				parttime: "P",
				temporary: "T",
				contract: "C",
				volunteer: "V",
			},
			experience: {
				INTERNSHIP: "1",
				ENTRY_LEVEL: "2",
				ASSOCIATE: "3",
				MID_LEVEL: "4",
				SENIOR_LEVEL: "4",
				DIRECTOR: "5",
				EXECUTIVE: "6",
			},
		};

		const location =
			Preferences.locations[
				Math.floor(Math.random() * Preferences.locations.length)
			];

		const title =
			Preferences.titles[Math.floor(Math.random() * Preferences.titles.length)];

		this.jobSearchParams = {
			autoApply: {
				name: "f_AL",
				value: "true",
			},
			experience: {
				name: "f_E",
				value:
					LinkedInSearchParamsMapper.experience[Preferences.experienceLevel],
			},
			type: {
				name: "f_JT",
				value: LinkedInSearchParamsMapper.type[Preferences.jobType],
			},
			location: {
				name: "location",
				value: location,
			},
			title: {
				name: "keywords",
				value: encodeURIComponent(title),
			},
		};

		const stringSearchParams = Object.entries(this.jobSearchParams)
			.map(([, { name, value }]) => `${name}=${value}`)
			.join("&");

		this.driver.get(
			`https://www.linkedin.com/jobs/search/?${stringSearchParams}`
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
		await this.fillJobInfo();
		await Helper.scroll();
		await this.driver.sleep(1000);
		await this.continue();
	}

	async fillJobInfo(): Promise<void> {
		const company = await Helper.getText(".ia-JobHeader-information span");
		const position = await Helper.getText(".ia-JobHeader-information h2");

		console.log("Job info:", position, company);

		this.job = new Job(
			position,
			company,
			"no-description",
			this.jobSearchParams?.title?.value as string
		);
	}

	async answerQuestions() {
		const qaManager = new QAManager(
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
		if (Preferences?.coverLetter && Preferences?.coverLetter !== "") {
			const textarea = await this.driver.findElement(
				By.css(this.selectors.textarea)
			);
			await this.driver.executeScript(
				(element: any) => element.select(),
				textarea
			);
			await textarea.sendKeys(Key.BACK_SPACE);

			const coverLetter = new CoverLetter(
				Preferences,
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

export class LinkedInSiteCreator extends SiteCreator {
	public factoryMethod(driver: WebDriver): Site {
		const selectors = {
			errorsXpath: "//div[@class='css-mllman e1wnkr790']",
			bigJobCard: "#vjs-container-iframe",
			applyButton: ".ia-LinkedInApplyButton",
			nextButton: ".ia-continueButton",
			coverLetter: "div.css-kyg8or",
			smallJobCard: ".cardOutline",
			signedIn: "#AccountMenu",
			textarea: "textarea",
		};
		return new LinkedInSite(driver, selectors);
	}
}
