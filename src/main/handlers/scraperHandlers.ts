import { ipcMain, powerSaveBlocker } from "electron";

import { SingletonCategorizer } from "../scrapper/Categorizer";
import Preferences from "../scrapper/Preferences";

import {
	Driver,
	IndeedSiteCreator,
	killDriverProcess,
	Status,
} from "../driver";

let blockerId = 0;

const scraperHandlers = () => {
	const driver = new Driver(new IndeedSiteCreator());

	ipcMain.on("scraper:start", async (event, preferences) => {
		Preferences.setPreferences(preferences);
		SingletonCategorizer.load(preferences.answers);

		event.reply("scraper:status", Status.RUNNING);

		blockerId = powerSaveBlocker.start("prevent-display-sleep");
		await driver.start();
	});

	ipcMain.on("scraper:stop", async (event) => {
		await driver.stop();
		killDriverProcess();
		event.reply("scraper:status", driver.getStatus());
		powerSaveBlocker.stop(blockerId);
	});

	ipcMain.on("scraper:pause", async (event) => {
		driver.pause();
		event.reply("scraper:status", driver.getStatus());
	});

	ipcMain.on("scraper:resume", async (event) => {
		await driver.resume();
		event.reply("scraper:status", Status.RUNNING);
	});

	ipcMain.on("scraper:status", (e) => {
		e.reply("scraper:status", driver.getStatus());
	});
};

export default scraperHandlers;
