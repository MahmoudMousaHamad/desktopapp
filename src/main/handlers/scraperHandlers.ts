import { ipcMain, powerSaveBlocker } from "electron";

import { SingletonCategorizer } from "../scrapper/Categorizer";
import { killDriverProcess } from "../scrapper/DriverManager";
import Preferences from "../scrapper/UserPrefernces";
import { Scraper } from "../scrapper";

const scraper = new Scraper();
let blockerId = 0;

const scraperHandlers = () => {
	ipcMain.on("scraper:start", async (event, preferences) => {
		Preferences.setPreferences(preferences);
		SingletonCategorizer.load(preferences.answers);

		event.reply("scraper:status", "running");

		blockerId = powerSaveBlocker.start("prevent-display-sleep");
		await scraper.start();
	});

	ipcMain.on("scraper:stop", async (event) => {
		await scraper.stop();
		killDriverProcess();
		event.reply("scraper:status", scraper.getStatus());
		powerSaveBlocker.stop(blockerId);
	});

	ipcMain.on("scraper:pause", async (event) => {
		scraper.pause();
		event.reply("scraper:status", scraper.getStatus());
	});

	ipcMain.on("scraper:resume", async (event) => {
		event.reply("scraper:status", "running");
		await scraper.resume();
	});

	ipcMain.on("scraper:status", (e) => {
		e.reply("scraper:status", scraper.getStatus());
	});
};

export default scraperHandlers;
