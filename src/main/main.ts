/* eslint-disable promise/param-names */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, ipcMain, shell } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import path from "path";

import ElectronGoogleOAuth2 from "@getstation/electron-google-oauth2";
import scraperHandlers from "./handlers/scraperHandlers";
import { resolveHtmlPath } from "./util";
import {
	downloadChromeDriver,
	killDriverProcess,
} from "./applier/driver/Manager";
import Logger from "./applier/lib/Logger";
import autoUpdaterHandlers from "./handlers/autoUpdaterHandlers";

const RESOURCES_PATH = app.isPackaged
	? path.join(process.resourcesPath, "assets")
	: path.join(__dirname, "../../assets");

const getAssetPath = (...paths: string[]): string => {
	return path.join(RESOURCES_PATH, ...paths);
};

export default class AppUpdater {
	constructor() {
		log.transports.file.level = "info";
		autoUpdater.logger = log;
		autoUpdater.autoDownload = false;
		autoUpdater.checkForUpdates();
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

const isDev = process.env.NODE_ENV !== "production";

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

	if (app.isPackaged) {
		// eslint-disable-next-line no-new
		new AppUpdater();
	}

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
};

app.on("window-all-closed", async () => {
	// Respect the OSX convention of having the application in memory even
	// after all windows have been closed
	if (process.platform !== "darwin") app.quit();
	await killDriverProcess();
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

const CLIENT_ID =
	"553378665672-jp12mu060ibedm09lbi3k9v0pl6n657h.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const myApiOauth = new ElectronGoogleOAuth2(CLIENT_ID, CLIENT_SECRET, [], {
	successRedirectURL: "https://google.com",
});

ipcMain.on("google-oath", async () => {
	const tokens = await myApiOauth.openAuthWindowAndGetTokens();
	mainWindow?.webContents.send("login-done");
	mainWindow?.webContents.send("google-oauth-tokens", tokens);
	mainWindow?.focus();
});

ipcMain.on("open-url", (_e, href) => {
	if (typeof href === "string") {
		shell.openExternal(href);
	}
});

ipcMain.on("focus-window", () => {
	mainWindow?.focus();
});

ipcMain.on("open-stripe", async (_e, { email, userId }) => {
	shell.openExternal(
		`${
			isDev
				? "https://buy.stripe.com/test_14kbKU3rZfpR7xC9AA"
				: "https://buy.stripe.com/bIY00L4YR87U08M5kk"
		}?prefilled_email=${email}&client_reference_id=${userId}`
	);
});

autoUpdaterHandlers();
scraperHandlers();
