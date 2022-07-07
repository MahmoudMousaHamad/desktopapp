/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from "path";
import { app, BrowserWindow, shell, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

import { exec } from "child_process";
import MenuBuilder from "./menu";
import { resolveHtmlPath } from "./util";
import Scraper from "./scrapper";
import Preferences from "./scrapper/UserPrefernces";

export default class AppUpdater {
  constructor() {
    log.transports.file.level = "info";
    autoUpdater.logger = log;
    // autoUpdater.requestHeaders = { "PRIVATE-TOKEN": "glpat-TuBeeX7Y18UEzcfKdbf2" };
    // autoUpdater.autoDownload = true;
    // autoUpdater.setFeedURL({
    //   provider: "generic",
    //   url: "https://gitlab.com/api/v4/projects/37126811/jobs/artifacts/main/raw/release/build?job=build"
    // });
    // "publish": {
    //   "provider": "generic",
    //   "url": "https://gitlab.com/api/v4/projects/desktopapp/jobs/artifacts/main/raw/release/build?job=build"
    // },
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on("ipc-example", async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply("ipc-example", msgTemplate("pong"));
});

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
    // width: 1024,
    // height: 728,
    icon: getAssetPath("icon.png"),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, "preload.js")
        : path.join(__dirname, "../../.erb/dll/preload.js"),
      // nodeIntegration: true,
      // contextIsolation: false,
    },
  });

  mainWindow.maximize();
  mainWindow.loadURL(resolveHtmlPath("index.html"));

  mainWindow.on("ready-to-show", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
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

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  autoUpdater.on("checking-for-update", function () {
    sendStatusToWindow("Checking for update...");
  });

  autoUpdater.on("update-available", function (info) {
    sendStatusToWindow("Update available.");
  });

  autoUpdater.on("update-not-available", function (info) {
    sendStatusToWindow("Update not available.");
  });

  autoUpdater.on("error", function (err) {
    sendStatusToWindow("Error in auto-updater.");
  });

  autoUpdater.on("download-progress", function (progressObj) {
    let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
    log_message = `${log_message} - Downloaded ${parseInt(
      progressObj.percent
    )}%`;
    log_message = `${log_message} (${progressObj.transferred}/${progressObj.total})`;
    sendStatusToWindow(log_message);
  });

  autoUpdater.on("update-downloaded", function (info) {
    sendStatusToWindow("Update downloaded; will install in 1 seconds");
  });

  autoUpdater.on("update-downloaded", function (info) {
    setTimeout(function () {
      autoUpdater.quitAndInstall();
    }, 1000);
  });

  autoUpdater.checkForUpdates();

  function sendStatusToWindow(message: string) {
    console.log("Window status:", message);
  }
};

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    // Kill chrome driver process
    exec("pkill -9 -f chromedriver");
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on("activate", () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

const scraper = new Scraper.Scraper();

ipcMain.on("start-scraper", async (event, preferences) => {
  Preferences.setPreferences(preferences);
  event.reply("scraper-status", "running");
  await scraper.start();
});

ipcMain.on("stop-scraper", async (event) => {
  await scraper.stop();
  exec("pkill -9 -f chromedriver");
  event.reply("scraper-status", scraper.getRunning());
});

ipcMain.on("pause-scraper", async (event) => {
  scraper.pause();
  event.reply("scraper-status", scraper.getRunning());
});

ipcMain.on("resume-scraper", async (event) => {
  event.reply("scraper-status", "running");
  await scraper.resume();
});

ipcMain.on("scraper-status", (e) => {
  e.reply("scraper-status", scraper.getRunning());
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
