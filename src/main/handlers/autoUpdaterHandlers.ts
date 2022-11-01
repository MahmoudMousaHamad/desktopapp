import { autoUpdater } from "electron-updater";
import { dialog } from "electron";

import Logger from "../lib/Logger";

const autoUpdaterHandlers = () => {
	autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
		const dialogOpts = {
			type: "info",
			buttons: ["Restart", "Later"],
			title: "Application Update",
			message: process.platform === "win32" ? releaseNotes : releaseName,
			detail:
				"A new version has been downloaded. Restart the application to apply the updates.",
		};

		dialog
			.showMessageBox(dialogOpts)
			.then((returnValue: any) => {
				if (returnValue.response === 0) {
					autoUpdater.quitAndInstall();
				}
				return returnValue;
			})
			.catch(Logger.info);
	});

	autoUpdater.on("error", (message) => {
		Logger.error("There was a problem updating the application");
		Logger.error(message);
	});
};

export default autoUpdaterHandlers;
