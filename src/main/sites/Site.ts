/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */

import { Helper } from "main/driver";
import { Job } from "main/jobapplication";
import { By, WebDriver } from "selenium-webdriver";

export enum Status {
	RESTART,
	RUNNING,
	STOPPED,
	PAUSED,
}

interface LocationAction {
	[location: string]: {
		action(): Promise<void>;
		strings: string[];
		type: string;
	};
}

export interface SiteInterface {
	locationsAndActions: LocationAction;
	driver: WebDriver;
	selectors: any;

	submitApplication(): Promise<void>;
	answerQuestions(): Promise<void>;
	goToJobsPage(): Promise<void>;
}

interface JobSearchParams {
	[name: string]: {
		value: string;
		name: string;
	};
}

export abstract class Site implements SiteInterface {
	abstract answerQuestions(): Promise<void>;
	abstract goToJobsPage(): Promise<void>;

	locationsAndActions: {
		[name: string]: { strings: string[]; type: string; action: () => any };
	};

	jobSearchParams?: JobSearchParams;

	submittedDate?: Date;

	driver: WebDriver;

	selectors: {
		[name: string]: { selector: string; by: (selector: string) => By };
	};

	job?: Job;

	constructor(driver: WebDriver, selectors: any) {
		this.locationsAndActions = {};
		this.selectors = selectors;
		this.driver = driver;
	}

	static getBy(selector: any): By {
		return selector.by(selector.selector);
	}

	async getJobInfo(): Promise<void> {
		const company = await Helper.getText(
			Site.getBy(this.selectors.companyName)
		);
		const position = await Helper.getText(Site.getBy(this.selectors.position));

		console.log("Job info:", position, company);

		this.job = new Job(
			position,
			company,
			"no-description",
			this.jobSearchParams?.title?.value as string
		);
	}

	async resumeSection() {
		await this.getJobInfo();
		await Helper.scroll();
		await this.driver.sleep(1000);
		await this.continue();
	}

	async submitApplication() {
		await this.continue();
	}

	async exitApplication() {
		await this.goToJobsPage();
		await this.driver.sleep(1000);
		await Helper.acceptAlert();
	}

	async handleDoneAnsweringQuestions() {
		await this.continue();
		if (
			(await this.driver.findElements(Site.getBy(this.selectors.errors)))
				.length > 0
		) {
			await this.exitApplication();
		}
	}

	async continue() {
		await (
			await this.driver.findElement(Site.getBy(this.selectors.nextButton))
		).click();
	}
}
