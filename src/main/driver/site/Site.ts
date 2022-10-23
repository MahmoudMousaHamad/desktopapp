/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */

import { WebDriver } from "selenium-webdriver";

export enum Status {
	RESTART,
	RUNNING,
	STOPPED,
	PAUSED,
}

export interface Site {
	locationsAndActions: any;
	driver: WebDriver;
	selectors: any;

	submitApplication(): Promise<void>;
	answerQuestions(): Promise<void>;
	goToJobsPage(): Promise<void>;
}
