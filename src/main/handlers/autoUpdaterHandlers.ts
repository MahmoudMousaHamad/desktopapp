import { autoUpdater } from "electron-updater";
import { dialog } from "electron";

import Logger from "../applier/lib/Logger";

const autoUpdaterHandlers = () => {
	autoUpdater.on(
		"update-downloaded",
		async (event, releaseNotes, releaseName) => {
			const dialogOpts = {
				type: "info",
				buttons: ["Restart", "Later"],
				title: "Application Update",
				message: process.platform === "win32" ? releaseNotes : releaseName,
				detail:
					"A new version has been downloaded. Restart the application to apply the updates.",
			};

			const d = await dialog.showMessageBox(dialogOpts);
			if (d.response === 0) autoUpdater.quitAndInstall();
			else Logger.error(d.response);
		}
	);

	autoUpdater.on("error", (message) => {
		Logger.error("There was a problem updating the application");
		Logger.error(message);
	});
};

autoUpdater.on("update-available", async (info) => {
	console.log("Update Available");
	console.log(`Version : ${info.version}`);
	console.log(`Release Date : ${info.releaseDate}`);

	const d = await dialog.showMessageBox({
		title: "Updates",
		type: "info",
		message: "Update Available",
		detail: "A new version has been found. Click on Update to Update",
		buttons: ["Update", "Cancel"],
	});

	if (d.response === 0) {
		await autoUpdater.downloadUpdate();
	}

	autoUpdater.autoInstallOnAppQuit = true;
});

autoUpdater.on("error", (err) => {
	dialog.showMessageBox({
		title: "Updates",
		type: "error",
		message: "Error",
		detail: `Error name: ${err.name}
Error Message: ${err.message}
Error Stack: ${err.stack}`,
		buttons: ["Cancel"],
	});
});

export default autoUpdaterHandlers;
