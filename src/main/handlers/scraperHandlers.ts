import { ipcMain, powerSaveBlocker } from "electron";

import { IndeedSiteCreator, LinkedInSiteCreator, Status } from "../sites";
import { SingletonCategorizer } from "../lib/Categorizer";
import SingletonPreferences from "../lib/Preferences";
import { killDriverProcess, Driver } from "../driver";

const LINKEDIN = 1;
const INDEED = 2;

let blockerId = 0;

const scraperHandlers = () => {
	const selected = LINKEDIN;
	let siteCreator = new LinkedInSiteCreator();

	if (selected === INDEED) siteCreator = new IndeedSiteCreator();

	const driver = new Driver(siteCreator);

	ipcMain.on("scraper:start", async (event, preferences) => {
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
		driver.pause();
		event.reply("scraper:status", driver.getStatus());
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
