/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, shell } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import path from "path";

import scraperHandlers from "./handlers/scraperHandlers";
import { resolveHtmlPath } from "./util";
import {
	downloadChromeDriver,
	killDriverProcess,
} from "./scrapper/DriverManager";
import Logger from "./scrapper/Logger";
import autoUpdaterHandlers from "./handlers/autoUpdaterHandlers";

export default class AppUpdater {
	constructor() {
		log.transports.file.level = "info";
		autoUpdater.logger = log;
		autoUpdater.checkForUpdatesAndNotify();
	}
}

let mainWindow: BrowserWindow | null = null;
let splash: BrowserWindow | null = null;

if (process.env.NODE_ENV === "production") {
	const sourceMapSupport = require("source-map-support");
	sourceMapSupport.install();
}

const isDebug =
	process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true";

if (isDebug) {
	require("electron-debug")({ showDevTools: false });
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
		.catch(Logger.info);
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
		webPreferences: {
			preload: app.isPackaged
				? path.join(__dirname, "preload.js")
				: path.join(__dirname, "../../.erb/dll/preload.js"),
		},
		icon: getAssetPath("icon.png"),
		titleBarStyle: "hidden",
		titleBarOverlay: true,
		show: false,
	});

	splash = new BrowserWindow({
		icon: getAssetPath("icon.png"),
		transparent: true,
		alwaysOnTop: true,
		resizable: false,
		frame: false,
		height: 400,
		width: 400,
	});

	const splashScreenSrc = app.isPackaged
		? path.join(process.resourcesPath, "assets", "splash.html")
		: path.join(__dirname, "../../assets", "splash.html");

	splash.loadFile(splashScreenSrc);

	mainWindow.loadURL(resolveHtmlPath("index.html"));

	mainWindow.on("ready-to-show", () => {
		if (!mainWindow) {
			throw new Error('"mainWindow" is not defined');
		}
		splash?.destroy();
		mainWindow.maximize();
	});

	mainWindow.on("closed", () => {
		mainWindow = null;
	});

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

app.on("window-all-closed", () => {
	// Respect the OSX convention of having the application in memory even
	// after all windows have been closed
	if (process.platform !== "darwin") {
		app.quit();
	}

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
	.catch(Logger.info);

autoUpdaterHandlers();
scraperHandlers();

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
