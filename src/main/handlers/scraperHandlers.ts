import { ipcMain, powerSaveBlocker } from "electron";

import { killDriverProcess } from "../applier/driver";
import {
	IndeedSiteCreator,
	LinkedInSiteCreator,
	Status,
} from "../applier/sites";
import { SingletonCategorizer } from "../applier/lib/Categorizer";
import SingletonPreferences from "../applier/lib/Preferences";
import { Logger } from "../applier/lib";

let blockerId = 0;

let site = new LinkedInSiteCreator();

const scraperHandlers = () => {
	site = new LinkedInSiteCreator();

	ipcMain.on("scraper:start", async (event, preferences) => {
		Logger.info(`Site: ${preferences.site}`);
		if (preferences.site === "INDEED") {
			site = new IndeedSiteCreator();
		} else {
			site = new LinkedInSiteCreator();
		}

		SingletonPreferences.setPreferences(preferences);
		SingletonCategorizer.load(preferences.answers);

		event.reply("scraper:status", Status.RUNNING);

		blockerId = powerSaveBlocker.start("prevent-display-sleep");
		try {
			await site.start();
		} catch (e) {
			Logger.error(e);
		}
	});

	ipcMain.on("scraper:stop", async (event) => {
		if (site.status === Status.RUNNING || site.status === Status.PAUSED) {
			Logger.info("Stopping bot 1");
			await site.stop();
			await killDriverProcess();
			event.reply("scraper:status", site.getStatus());
			powerSaveBlocker.stop(blockerId);
		}
	});

	ipcMain.on("scraper:pause", async (event) => {
		event.reply("scraper:status", site.getStatus());
		await site.pause();
	});

	ipcMain.on("scraper:resume", async (event) => {
		event.reply("scraper:status", Status.RUNNING);
		await site.resume();
	});

	ipcMain.on("scraper:status", (e) => {
		e.reply("scraper:status", site.getStatus());
	});
};

export default scraperHandlers;
