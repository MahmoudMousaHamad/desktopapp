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
	dialog,
	ipcMain,
	ipcRenderer,
	shell,
} from "electron";
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

export default class AppUpdater {
	constructor() {
		log.transports.file.level = "info";
		autoUpdater.logger = log;
		autoUpdater.checkForUpdatesAndNotify();
	}
}

let mainWindow: BrowserWindow | null = null;
let splash: BrowserWindow | null = null;
let deeplinkingUrl = "";

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

	if (process.platform === "win32") {
		// Keep only command line / deep linked arguments
		[deeplinkingUrl] = process.argv.slice(1);
	}
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

app.setAsDefaultProtocolClient("jobapplier");

app.on("open-url", (event, url) => {
	const code = url.split("code");
	ipcRenderer.send("google-oauth-code", code);
	dialog.showErrorBox("Welcome Back", `You arrived from: ${url}`);
});

ipcMain.on("google-oath", async () => {
	const tokens = await myApiOauth.openAuthWindowAndGetTokens();
	mainWindow?.webContents.send("google-oauth-tokens", tokens);
	mainWindow?.focus();
});

autoUpdaterHandlers();
scraperHandlers();
