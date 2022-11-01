/* eslint-disable import/no-named-as-default */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { WebDriver, By } from "selenium-webdriver";
import { BrowserWindow } from "electron";

import { Job, QnAManager } from "../jobapplication";
import { Locator, Helper } from "../driver";
import { SingletonPreferences } from "../lib";

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
		resume: {
			strings: ["Resume"],
			type: Locator.TEXT,
			action: this.resumeSection.bind(this),
		},
		questions: {
			strings: ["Contact info", "Additional Questions", "Work authorization"],
			type: Locator.TEXT,
			action: this.answerQuestions.bind(this),
		},
		review: {
			strings: ["Review your application", "Submit application"],
			type: Locator.TEXT,
			action: this.submitApplication.bind(this),
		},
		submitted: {
			strings: ["Your application was sent"],
			type: Locator.TEXT,
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
			SingletonPreferences.locations[
				Math.floor(Math.random() * SingletonPreferences.locations.length)
			];

		const title =
			SingletonPreferences.titles[
				Math.floor(Math.random() * SingletonPreferences.titles.length)
			];

		this.jobSearchParams = {
			autoApply: {
				name: "f_AL",
				value: "true",
			},
			experience: {
				name: "f_E",
				value:
					LinkedInSearchParamsMapper.experience[
						SingletonPreferences.experienceLevel
					],
			},
			type: {
				name: "f_JT",
				value: LinkedInSearchParamsMapper.type[SingletonPreferences.jobType],
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

		await this.enterApplication();
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
				if ((await card.getText()).toLowerCase().includes("applied")) continue;
			} catch (e) {
				continue;
			}

			await card.click();

			await this.driver.sleep(2500);

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
		await this.driver.sleep(1000);
		await this.continue();
	}

	async getJobInfo(): Promise<void> {
		const company = await Helper.getText(this.selectors.companyName);
		const position = await Helper.getText(this.selectors.position);

		console.log("Job info:", position, company);

		this.job = new Job(
			position,
			company,
			"no-description",
			this.jobSearchParams?.title?.value as string
		);
	}

	async answerQuestions() {
		const qnaManager = new QnAManager(
			this.driver,
			this.handleDoneAnsweringQuestions.bind(this),
			this.exitApplication.bind(this),
			"//div[@class='jobs-easy-apply-content']"
		);
		await qnaManager.startWorkflow();
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

	async continueToApplication() {
		await this.continue();
	}

	async submitApplication() {
		await this.continue();
	}

	async continue() {
		await (
			await this.driver.findElement(By.xpath(this.selectors.nextButtonXpath))
		).click();
	}
}

export class LinkedInSiteCreator extends SiteCreator {
	public factoryMethod(driver: WebDriver): Site {
		const selectors = {
			errorsXpath: "//p[ends-wth(@id,'error-message')]",
			jobCardBigXpath:
				"//section[starts-with(@class,'scaffold-layout__detail')]",
			applyButton: "button.jobs-apply-button",
			nextButtonXpath: "//span[text()[contains(.,'Next')]]/..",
			smallJobCard: "ul.scaffold-layout__list-container > li",
			companyName: ".jobs-unified-top-card__company-name",
			position: ".jobs-unified-top-card__job-title",
			signedIn: "#ember15",
			textarea: "textarea",
		};
		return new LinkedInSite(driver, selectors);
	}
}
