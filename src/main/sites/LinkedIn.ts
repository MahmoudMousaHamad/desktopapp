/* eslint-disable import/no-named-as-default */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { WebDriver, By } from "selenium-webdriver";
import { BrowserWindow } from "electron";

import { QnAManager } from "../jobapplication";
import { SingletonPreferences } from "../lib";
import { Locator, Helper } from "../driver";

import { Site } from "./Site";
import SiteCreator from "./SiteCreator";

export class LinkedInSite extends Site {
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
			Site.getBy(this.selectors.smallJobCard)
		);

		for (const card of cards) {
			try {
				if ((await card.getText()).toLowerCase().includes("applied")) continue;
			} catch (e) {
				continue;
			}

			await card.click();

			await this.driver.sleep(2500);

			if (
				(await this.driver.findElements(Site.getBy(this.selectors.applyButton)))
					.length > 0
			) {
				try {
					await this.driver
						.findElement(Site.getBy(this.selectors.applyButton))
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

		if (!applyNowPressed) await this.goToJobsPage();
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
}

export class LinkedInSiteCreator extends SiteCreator {
	public createSite(driver: WebDriver): Site {
		const selectors = {
			errors: {
				selector: "//p[ends-wth(@id,'error-message')]",
				by: By.xpath,
			},
			jobCardBigXpath: {
				selector: "//section[starts-with(@class,'scaffold-layout__detail')]",
				by: By.xpath,
			},
			applyButton: {
				selector: "button.jobs-apply-button",
				by: By.css,
			},
			nextButton: {
				selector: "//span[text()[contains(.,'Next')]]/..",
				by: By.xpath,
			},
			smallJobCard: {
				selector: "ul.scaffold-layout__list-container > li",
				by: By.css,
			},
			companyName: {
				selector: ".jobs-unified-top-card__company-name",
				by: By.css,
			},
			position: {
				selector: ".jobs-unified-top-card__job-title",
				by: By.css,
			},
			signedIn: {
				selector: "#ember15",
				by: By.css,
			},
			textarea: {
				selector: "textarea",
				by: By.css,
			},
		};
		return new LinkedInSite(driver, selectors);
	}
}
