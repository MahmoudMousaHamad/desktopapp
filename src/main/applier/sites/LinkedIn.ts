/* eslint-disable import/no-named-as-default */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { WebDriver, By } from "selenium-webdriver";

import { QnAManager, QuestionInfo } from "../jobapplication";
import { SingletonPreferences } from "../lib";
import { Locator, Helper } from "../driver";

import { Site } from "./Site";
import SiteCreator from "./SiteCreator";

export class LinkedInSite extends Site {
	locationsAndActions = {
		review: {
			strings: ["Review your application", "Submit application"],
			type: Locator.TEXT,
			action: this.submitApplication.bind(this),
		},
		submitted: {
			strings: ["Your application was sent"],
			type: Locator.TEXT,
			action: this.handleSubmitted.bind(this),
		},
		questions: {
			strings: ["Contact info", "Additional Questions", "Work authorization"],
			type: Locator.TEXT,
			action: this.answerQuestions.bind(this),
		},
		resume: {
			strings: [
				".ui-attachment__download-button",
				".jobs-resume-picker__resume",
			],
			type: Locator.ELEMENT,
			action: this.resumeSection.bind(this),
		},
	};

	async resumeSection() {
		const chooseBtn = await this.driver.findElement(
			By.css("button[aria-label='Choose Resume']")
		);
		if (chooseBtn) await chooseBtn.click();
		await this.continue();
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

		const jobSearchParams = {
			autoApply: {
				name: "f_AL",
				value: "true",
			},
			experience: {
				name: "f_E",
				value: SingletonPreferences.getValue("LINKEDIN", "experienceLevel"),
			},
			type: {
				name: "f_JT",
				value: SingletonPreferences.getValue("LINKEDIN", "jobType"),
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

		const stringSearchParams = Object.entries(jobSearchParams)
			.map(([, { name, value }]) => `${name}=${value}`)
			.join("&");

		await this.driver.get(
			`https://www.linkedin.com/jobs/search/?${stringSearchParams}`
		);

		this.currentJobStartDate = Date.now();

		await this.enterApplication();
	}

	async enterApplication() {
		let applyNowPressed = false;

		await this.driver.sleep(1000);

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

			await this.driver.sleep(3000);

			if (
				(await this.driver.findElements(Site.getBy(this.selectors.applyButton)))
					.length > 0
			) {
				try {
					this.job = await this.getJobInfo();
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

		await this.continue();
	}

	async answerQuestions() {
		await new QnAManager(this).startWorkflow();
	}
}

export class LinkedInSiteCreator extends SiteCreator {
	public createSite(driver: WebDriver): Site {
		const questionsInfo = super.getQuestionsInfo();
		questionsInfo.radio = new QuestionInfo(
			"radio",
			"input[type=radio]",
			"legend",
			"//label"
		);
		const selectors = {
			errors: {
				// TODO: change this selector
				selector: "#todo-change-me",
				by: By.css,
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
				selector:
					"//span[text()[contains(.,'Next') or contains(.,'Review') or contains(.,'Submit application')]]/..",
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
			questions: {
				// was: "//div[@class='jobs-easy-apply-content']//*[(self::input or self::textarea or self::select)]/ancestor::*/preceding-sibling::*[self::legend or self::label]/..",
				selector:
					"//div[@class='jobs-easy-apply-content']//*[(*[input or select or textarea])]",
				by: By.xpath,
			},
		};
		return new LinkedInSite(
			driver,
			selectors,
			questionsInfo,
			"https://www.linkedin.com/jobs/"
		);
	}
}
