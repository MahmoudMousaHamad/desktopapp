/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */

import { By, WebDriver } from "selenium-webdriver";

import { BrowserWindow } from "electron";
import { QuestionsInfo } from "../jobapplication/Question";
import { Job } from "../jobapplication";
import { Helper } from "../driver";

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
	questionsInfo: QuestionsInfo;
	driver: WebDriver;
	jobsURL: string;
	selectors: any;
	name: string;

	submitApplication(): Promise<void>;
	answerQuestions(): Promise<void>;
	goToJobsPage(): Promise<void>;
}

export abstract class Site implements SiteInterface {
	abstract answerQuestions(): Promise<void>;

	questionsInfo: QuestionsInfo;

	locationsAndActions: {
		[name: string]: { strings: string[]; type: string; action: () => any };
	};

	driver: WebDriver;

	selectors: {
		[name: string]: { selector: string; by: (selector: string) => By };
	};

	jobs: Job[] = [];

	job?: Job | null;

	count: number = 0;

	jobsURL: string;

	currentJobStartDate: number = Date.now();

	name: string = "";

	constructor(
		driver: WebDriver,
		selectors: any,
		questionsInfo: QuestionsInfo,
		jobsURL: string
	) {
		this.questionsInfo = questionsInfo;
		this.locationsAndActions = {};
		this.selectors = selectors;
		this.jobsURL = jobsURL;
		this.driver = driver;
	}

	static getBy(selector: any): By {
		return selector.by(selector.selector);
	}

	async goToJobsPage(): Promise<void> {
		await Helper.checkAlert();
	}

	async getJobInfo(): Promise<Job> {
		let company = await Helper.getText(Site.getBy(this.selectors.companyName));
		let position = await Helper.getText(Site.getBy(this.selectors.position));

		console.log("Job info:", position, company);

		if (company.length === 0) company = "N/A";
		if (position.length === 0) position = "N/A";

		return new Job(position, company, "no-description", this.name);
	}

	async resumeSection() {
		await Helper.scroll();
		await this.continue();
	}

	async submitApplication() {
		await this.continue();
	}

	async handleSubmitted() {
		this.count += 1;
		if (this.job) {
			this.job.submissionDate = Date.now();
			this.jobs.push({ ...this.job });
			this.job = null;
		}
		console.log(
			"Submitted application. Application count:",
			this.count,
			this.jobs
		);
		BrowserWindow.getAllWindows()[0].webContents.send("application-submitted");
		await this.goToJobsPage();
	}

	async exitApplication() {
		await this.goToJobsPage();
		await this.driver.sleep(500);
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
