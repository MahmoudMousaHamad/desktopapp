import { ipcMain, powerSaveBlocker } from "electron";

import { IndeedSiteCreator, LinkedInSiteCreator, Status } from "../sites";
import { SingletonCategorizer } from "../lib/Categorizer";
import SingletonPreferences from "../lib/Preferences";
import { killDriverProcess, Driver } from "../driver";
import { Logger } from "../lib";

let blockerId = 0;

const scraperHandlers = () => {
	const linkedin = new LinkedInSiteCreator();
	const indeed = new IndeedSiteCreator();
	let driver = new Driver(linkedin);

	ipcMain.on("scraper:start", async (event, preferences) => {
		Logger.info(`Site: ${preferences.site}`);
		if (preferences.site === "INDEED") driver = new Driver(indeed);
		else driver = new Driver(linkedin);

		SingletonPreferences.setPreferences(preferences);
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
		event.reply("scraper:status", driver.getStatus());
		await driver.pause();
	});

	ipcMain.on("scraper:resume", async (event) => {
		event.reply("scraper:status", Status.RUNNING);
		await driver.resume();
	});

	ipcMain.on("scraper:status", (e) => {
		e.reply("scraper:status", driver.getStatus());
	});
};

export default scraperHandlers;
