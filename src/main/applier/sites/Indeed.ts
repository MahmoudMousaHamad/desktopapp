/* eslint-disable import/no-named-as-default */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
import { WebDriver, By, Key } from "selenium-webdriver";

import { CoverLetter, Job, QnAManager } from "../jobapplication";
import { SingletonPreferences, Logger } from "../lib";
import { Helper, Locator } from "../driver";

import SiteCreator from "./SiteCreator";
import { Site } from "./Site";

const SOURCE = "SOURCE";
const TITLE = "TITLE";

export class IndeedSite extends Site {
	name: string = "INDEED";

	locationsAndActions = {
		jobs: {
			strings: [this.selectors.smallJobCard.selector],
			type: Locator.ELEMENT,
			action: this.enterApplication.bind(this),
		},
		resume: {
			strings: ["Upload or build a resume"],
			type: TITLE,
			action: this.resumeSection.bind(this),
		},
		experience: {
			strings: ["Add relevant work experience information"],
			type: TITLE,
			action: this.continue.bind(this),
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
			strings: ["Qualification check"],
			type: TITLE,
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
			action: this.handleSubmitted.bind(this),
			type: SOURCE,
		},
		questions: {
			strings: ["Answer screener questions from the employer"],
			type: TITLE,
			action: this.answerQuestions.bind(this),
		},
	};

	async goToJobsPage(): Promise<void> {
		await super.goToJobsPage();

		const location =
			SingletonPreferences.locations[
				Math.floor(Math.random() * (SingletonPreferences.locations.length - 1))
			];

		const title =
			SingletonPreferences.titles[
				Math.floor(Math.random() * (SingletonPreferences.titles.length - 1))
			];

		this.currentJobStartDate = Date.now();

		await this.driver.get(
			`https://www.indeed.com/jobs?q=${title}&l=${location}&sc=0kf%3Aexplvl(${SingletonPreferences.getValue(
				"INDEED",
				"experienceLevel"
			)})jt(${SingletonPreferences.getValue("INDEED", "jobType")})`
		);
	}

	async enterApplication() {
		let applyNowPressed = false;

		// await this.driver.sleep(1000);

		const cards = await this.driver.findElements(
			Site.getBy(this.selectors.smallJobCard)
		);

		for (const card of cards) {
			await this.driver.switchTo().defaultContent();

			try {
				if ((await card.getText()).includes("Applied")) continue;
			} catch (e) {
				continue;
			}

			await card.click();

			await this.driver.sleep(1000);

			const iframe = await this.driver.findElements(
				Site.getBy(this.selectors.bigJobCard)
			);

			if (iframe.length > 0) {
				await this.driver.switchTo().frame(iframe[0]);
			}

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

		await this.driver.switchTo().defaultContent();

		if (!applyNowPressed) await this.goToJobsPage();
	}

	async answerQuestions() {
		await new QnAManager(this).startWorkflow();
	}

	async chooseLetter() {
		try {
			await (
				await this.driver.findElements(Site.getBy(this.selectors.coverLetter))
			)[3].click();
		} catch (e) {
			Logger.error(e);
		}
		if (
			SingletonPreferences?.coverLetter &&
			SingletonPreferences?.coverLetter !== ""
		) {
			const textarea = await this.driver.findElement(
				Site.getBy(this.selectors.textarea)
			);
			await this.driver.executeScript(
				(element: any) => element.select(),
				textarea
			);
			await textarea.sendKeys(Key.BACK_SPACE);

			if (this.job) {
				const coverLetter = new CoverLetter(
					SingletonPreferences,
					textarea,
					this.job
				);
				await coverLetter.fill();
			}
		}
		await this.continue();
	}

	async continueToApplication() {
		await this.continue();
	}
}

export class IndeedSiteCreator extends SiteCreator {
	public createSite(driver: WebDriver): Site {
		const selectors = {
			errors: {
				selector: "//div[@class='css-mllman e1wnkr790']",
				by: By.xpath,
			},
			bigJobCard: {
				selector: "#vjs-container-iframe",
				by: By.css,
			},
			applyButton: {
				selector: ".ia-IndeedApplyButton",
				by: By.css,
			},
			nextButton: {
				selector: ".ia-continueButton",
				by: By.css,
			},
			coverLetter: {
				selector: "div.css-kyg8or",
				by: By.css,
			},
			smallJobCard: {
				selector: ".cardOutline",
				by: By.css,
			},
			signedIn: {
				selector: "#AccountMenu",
				by: By.css,
			},
			textarea: {
				selector: "textarea",
				by: By.css,
			},
			companyName: {
				selector: "div[data-company-name='true']",
				by: By.css,
			},
			position: {
				selector: ".jobsearch-JobInfoHeader-title-container",
				by: By.css,
			},
			questions: {
				selector:
					// Look into //*[*[label or legend]]
					"//*[(self::input or self::textarea or self::select)]/ancestor::*/preceding-sibling::label/..//label[not(./input)]/.. | //legend/..",
				by: By.xpath,
			},
		};
		return new IndeedSite(
			driver,
			selectors,
			super.getQuestionsInfo(),
			"https://www.indeed.com/"
		);
	}
}
