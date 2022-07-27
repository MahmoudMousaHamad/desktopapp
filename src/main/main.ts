/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import {
	app,
	BrowserWindow,
	shell,
	ipcMain,
	powerSaveBlocker,
	dialog,
} from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import path from "path";

import {
	downloadChromeDriver,
	killDriverProcess,
} from "./scrapper/DriverManager";
import Preferences from "./scrapper/UserPrefernces";
import { resolveHtmlPath } from "./util";
import MenuBuilder from "./menu";
import Scraper from "./scrapper";
import { SingletonCategorizer } from "./scrapper/Categorizer";

export default class AppUpdater {
	constructor() {
		log.transports.file.level = "info";
		autoUpdater.logger = log;
		autoUpdater.checkForUpdatesAndNotify();
	}
}

let mainWindow: BrowserWindow | null = null;

// app.commandLine.appendSwitch("ignore-certificate-errors");

if (process.env.NODE_ENV === "production") {
	const sourceMapSupport = require("source-map-support");
	sourceMapSupport.install();
}

const isDebug =
	process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true";

if (isDebug) {
	require("electron-debug")();
}

const installExtensions = async () => {
	const installer = require("electron-devtools-installer");
	const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
	const extensions = ["REACT_DEVELOPER_TOOLS"];

	return installer
		.default(
			extensions.map((name) => installer[name]),
			forceDownload
		)
		.catch(console.log);
};

const createWindow = async () => {
	if (isDebug) {
		await installExtensions();
	}

	const RESOURCES_PATH = app.isPackaged
		? path.join(process.resourcesPath, "assets")
		: path.join(__dirname, "../../assets");

	const getAssetPath = (...paths: string[]): string => {
		return path.join(RESOURCES_PATH, ...paths);
	};

	mainWindow = new BrowserWindow({
		show: false,
		icon: getAssetPath("icon.png"),
		webPreferences: {
			preload: app.isPackaged
				? path.join(__dirname, "preload.js")
				: path.join(__dirname, "../../.erb/dll/preload.js"),
		},
	});

	mainWindow.loadURL(resolveHtmlPath("index.html"));

	mainWindow.on("ready-to-show", () => {
		if (!mainWindow) {
			throw new Error('"mainWindow" is not defined');
		}
		mainWindow.maximize();
	});

	mainWindow.on("closed", () => {
		mainWindow = null;
	});

	const menuBuilder = new MenuBuilder(mainWindow);
	menuBuilder.buildMenu();

	// Open urls in the user's browser
	mainWindow.webContents.setWindowOpenHandler((edata) => {
		shell.openExternal(edata.url);
		return { action: "deny" };
	});

	if (app.isPackaged) {
		// eslint-disable-next-line
		new AppUpdater();

		setInterval(() => {
			autoUpdater.checkForUpdates();
		}, 60000);
	}
};

/**
 * Add event listeners...
 */

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
		.then((returnValue) => {
			if (returnValue.response === 0) autoUpdater.quitAndInstall();
		})
		.catch(console.log);
});

autoUpdater.on("error", (message) => {
	console.error("There was a problem updating the application");
	console.error(message);
});

app.on("window-all-closed", () => {
	// Respect the OSX convention of having the application in memory even
	// after all windows have been closed
	if (process.platform !== "darwin") {
		// Kill chrome driver process
		app.quit();
	}

	// exec("pkill -9 -f chromedriver");
	killDriverProcess();
});

app
	.whenReady()
	.then(async () => {
		createWindow();
		await downloadChromeDriver();

		app.on("activate", () => {
			// On macOS it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			if (mainWindow === null) createWindow();
		});
	})
	.catch(console.log);

let blockerId = 0;
const scraper = new Scraper.Scraper();

ipcMain.on("start-scraper", async (event, preferences) => {
	Preferences.setPreferences(preferences);
	SingletonCategorizer.load(preferences.answers);

	event.reply("scraper-status", "running");

	blockerId = powerSaveBlocker.start("prevent-display-sleep");

	await scraper.start();
});

ipcMain.on("stop-scraper", async (event) => {
	await scraper.stop();
	// exec("pkill -9 -f chromedriver");
	killDriverProcess();
	event.reply("scraper-status", scraper.getStatus());
	powerSaveBlocker.stop(blockerId);
});

ipcMain.on("pause-scraper", async (event) => {
	scraper.pause();
	event.reply("scraper-status", scraper.getStatus());
});

ipcMain.on("resume-scraper", async (event) => {
	event.reply("scraper-status", "running");
	await scraper.resume();
});

ipcMain.on("scraper-status", (e) => {
	e.reply("scraper-status", scraper.getStatus());
});

/**
 * Company website application workflows
 *
 * A)
 *  Find apply button (Press)
 *  Terms and conditions (Agree)
 *  Resume (Upload)
 *  Basic information (Fill)
 *  Work experience (Fill)
 *    Add more as necessary
 *  Education (Fill)
 *    Add more as necessary
 *  Additional attachments (Attach)
 *    Cover letter
 *  Application Questions (Fill)
 *    Questions are divided into divs
 *  Voluntary Disclosures (Fill)
 *  Disability self-identity (Fill)
 *  Review (Submit)
 *  Submission Verification (Log)
 *
 * B) Greenhouse
 *
 */
