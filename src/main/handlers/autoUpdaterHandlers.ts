import { autoUpdater } from "electron-updater";
import { dialog } from "electron";

import Logger from "../applier/lib/Logger";

const autoUpdaterHandlers = () => {
	autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
		const dialogOpts = {
			type: "info",
			buttons: ["Restart"],
			title: "Work-Shy Update",
			message: process.platform === "win32" ? releaseNotes : releaseName,
			detail:
				"A new version has been downloaded. Restart Work-Shy to apply the updates.",
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
