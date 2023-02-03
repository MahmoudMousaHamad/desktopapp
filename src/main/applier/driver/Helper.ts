/* eslint-disable class-methods-use-this */
/* eslint-disable no-await-in-loop */
import {
	By,
	Key,
	Locator,
	until,
	WebDriver,
	WebElement,
} from "selenium-webdriver";

import Logger from "../lib/Logger";

import { ScrollDown } from "./Scripts";

class Helper {
	driver: WebDriver;

	constructor(driver: WebDriver) {
		this.driver = driver;
	}

	init(driver: WebDriver) {
		this.driver = driver;
	}

	async scroll() {
		await this.driver?.executeScript(ScrollDown);
	}

	async checkTabs() {
		const tabs = (await this.driver?.getAllWindowHandles()) as string[];
		if (tabs.length > 1) {
			await this.driver?.switchTo().window(tabs[0]);
			await this.driver?.close();
			await this.driver?.switchTo().window(tabs[1]);
		}
	}

	async checkAlert() {
		console.log("Checking for an alert");
		try {
			const alert = await this.driver?.switchTo().alert();
			console.log("Alert exists");
			await alert.accept();
		} catch (e) {
			console.log("Alert doesn't exist", e);
			await this.driver?.switchTo().defaultContent();
		} finally {
			await this.driver?.switchTo().defaultContent();
		}
	}

	async getText(by: By): Promise<string> {
		return (await this.driver.findElement(by)).getText();
	}

	async waitFor(selector: Locator, timeout = 10) {
		try {
			const el = (await this.driver?.findElement(selector)) as WebElement;
			await this.driver?.wait(
				until.elementIsVisible(el),
				timeout,
				`Couldn't find ${selector}`
			);
		} catch (e) {
			Logger.error(`Could not find element ${selector}`);
			return false;
		}

		return true;
	}

	async acceptAlert() {
		const alert = await this.driver?.wait(until.alertIsPresent(), 2000);
		await alert?.accept();
	}

	async clearInput(element: WebElement) {
		const inputValueLength = (await element.getAttribute("value")).length;
		await (
			await element.getDriver()
		).executeScript((e: { select: () => any }) => e.select(), element);
		for (let i = 0; i < inputValueLength; i += 1) {
			await element.sendKeys(Key.BACK_SPACE);
		}
	}
}

export default new Helper(null as unknown as WebDriver);
