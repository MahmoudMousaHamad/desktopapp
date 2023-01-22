import { ipcMain, powerSaveBlocker } from "electron";

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

	ipcMain.on("applier:start", async (event, preferences) => {
		Logger.info(`Site: ${preferences.site}`);
		if (preferences.site === "INDEED") {
			site = new IndeedSiteCreator();
		} else {
			site = new LinkedInSiteCreator();
		}

		SingletonPreferences.setPreferences(preferences);
		SingletonCategorizer.load(preferences.answers);

		event.reply("applier:status", {
			status: Status.RUNNING,
			count: site.getStatus().count,
		});

		blockerId = powerSaveBlocker.start("prevent-display-sleep");
		try {
			await site.start();
		} catch (e) {
			Logger.error(
				`something went wrong while starting site ${preferences.site} ${e}`
			);
		}
	});

	ipcMain.on("applier:stop", async (event) => {
		if (site.status === Status.RUNNING || site.status === Status.PAUSED) {
			await site.stop();
			Logger.info("Stopped applier");
			event.reply("applier:status", site.getStatus());
			event.reply("session-ended", {
				count: site.getStatus().count,
				jobs: site.getJobs(),
			});
			powerSaveBlocker.stop(blockerId);
		}
	});

	ipcMain.on("applier:pause", async (event) => {
		event.reply("applier:status", site.getStatus());
		site.pause();
	});

	ipcMain.on("applier:resume", async (event) => {
		event.reply("applier:status", {
			status: Status.RUNNING,
			count: site.getStatus().count,
		});
		await site.resume();
	});

	ipcMain.on("applier:status", (e) => {
		e.reply("applier:status", site.getStatus());
	});
};

export default scraperHandlers;
