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

const { SOURCE, TITLE } = Locator;

export class IndeedSite extends Site {
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

		await this.driver.get(
			`https://www.indeed.com/jobs?q=${title}&l=${location}&sc=0kf%3Aexplvl(${SingletonPreferences.experienceLevel})jt(${SingletonPreferences.jobType})`
		);
	}

	async enterApplication() {
		let applyNowPressed = false;

		await this.driver.sleep(5000);

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

			await this.driver.sleep(2500);

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

	async chooseExperience() {
		await this.driver.sleep(1000);
		await this.continue();
	}

	async chooseLetter() {
		try {
			await (
				await this.driver.findElements(Site.getBy(this.selectors.coverLetter))
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
				Site.getBy(this.selectors.textarea)
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
}

export class IndeedSiteCreator extends SiteCreator {
	public createSite(driver: WebDriver): Site {
		const selectors = {
			errors: {
				selector: "//div[@class='css-mllman e1wnkr790']",
				by: By.css,
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
				selector: ".ia-JobHeader-information span",
				by: By.css,
			},
			position: {
				selector: ".ia-JobHeader-information h2",
				by: By.css,
			},
			questionsXpathPrefex: {
				selector: "",
				by: By.xpath,
			},
		};
		return new IndeedSite(driver, selectors, super.getQuestionsInfo());
	}
}
