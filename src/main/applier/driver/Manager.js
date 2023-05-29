/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
/* eslint-disable promise/no-nesting */
/* eslint-disable global-require */
/* eslint-disable new-cap */
import chrome from "selenium-webdriver/chrome";
import { app, dialog } from "electron";
import { exec } from "child_process";
import unzipper from "unzipper";
import https from "https";
import path from "path";
import fs from "fs";

import axios from "axios";
import { load } from "cheerio";
import { Logger, OS } from "../lib";

const {
	userChromeDataDir,
	chromeDriverPath,
	appDatatDirPath,
	targetPlatform,
	isWindows,
	isMac,
} = OS;

const chromeRemoteDebugPort = 9222;

export async function getChromeMajorVersion() {
	const chromeVersion = await require("find-chrome-version")();
	const chromeMajorVersion = chromeVersion.split(".")[0];

	Logger.info(`Chrome major version: ${chromeMajorVersion}`);

	if (Number(chromeMajorVersion) < 100) {
		dialog.showErrorBox(
			"Google Chrome Version Error",
			`Unfortunately, we don't support your current version of Chrome (${chromeMajorVersion}).
          As of now, we only support Chrome versions 100 and above. Please consider updating your
          Google Chrome browser.`
		);

		setTimeout(() => {
			app.exit(1);
		}, 5000);

		return false;
	}

	return chromeMajorVersion;
}

export async function downloadChromeDriver() {
	const chromeMajorVersion = await getChromeMajorVersion();

	if (!chromeMajorVersion)
		throw Error("Chrome version is not compatible with this application.");

	if (!fs.existsSync(appDatatDirPath)) fs.mkdirSync(appDatatDirPath);

	path.resolve(appDatatDirPath, "chromedriver");

	if (fs.existsSync(chromeDriverPath)) {
		Logger.info("Chrome driver exists, no need to download");
		return;
	}

	// Get the link to the chromedriver zip file
	// Parse the hhttps://chromedriver.chromium.org/downloads to get the link to the chromedriver zip file
	// Find the link element that starts with "ChromeDriver [major version].0."
	const r = await axios.get("https://chromedriver.chromium.org/downloads");
	const $ = load(r.data);
	const anchorElements = $("a");
	let fileUrl = null;
	// eslint-disable-next-line consistent-return
	anchorElements.each((index, element) => {
		const href = $(element).attr("href");
		const text = $(element).text();

		if (text.startsWith(`ChromeDriver ${chromeMajorVersion}.0.`)) {
			// Get the full version of the chromedriver from the link.
			// Example link: https://chromedriver.storage.googleapis.com/index.html?path=114.0.5735.16/
			const fullVersion = href.split("=")[1].replace("/", "");
			fileUrl = `https://chromedriver.storage.googleapis.com/${fullVersion}/chromedriver_${targetPlatform}.zip`;
			return false; // Exit the loop if a matching anchor element is found
		}
	});

	Logger.info(`Zip file url ${fileUrl}`);

	const file = fs.createWriteStream(
		path.join(appDatatDirPath, "chromedriver.zip")
	);

	https.get(fileUrl, (response) => {
		response.pipe(file);

		Logger.info("Downloading chrome driver...");

		// after download completed close filestream
		file.on("finish", async () => {
			file.close();
			Logger.info("Download of chrome driver file ended, unzipping...");

			fs.createReadStream(path.join(appDatatDirPath, "chromedriver.zip")).pipe(
				unzipper.Extract({ path: path.join(appDatatDirPath, "chromedriver") })
			);

			await new Promise((resolve) => setTimeout(resolve, 1000));

			fs.chmodSync(chromeDriverPath, "755");
		});
	});
}

export async function openChromeSession() {
	if (!fs.existsSync(userChromeDataDir)) fs.mkdirSync(userChromeDataDir);

	let chromeCommand;

	if (isWindows) {
		const chrome86Path =
			"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
		const chromePath =
			"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
		if (!(fs.existsSync(chrome86Path) || fs.existsSync(chromePath))) {
			throw Error(`
				It looks like Chrome is not installed. Please make sure that Chrome
				is installed correctly in ${chrome86Path} or ${chromePath}.
        	`);
		}
		chromeCommand = fs.existsSync(chrome86Path)
			? `"${chrome86Path}"`
			: `"${chromePath}"`;
	} else if (isMac) {
		chromeCommand =
			"/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome";
	} else {
		chromeCommand = "google-chrome";
	}

	// TODO: Use chrome-launcher to launch chrome
	const userAgent = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${await getChromeMajorVersion()}.0.0.0 Safari/537.36`;
	const fullCommand = `${chromeCommand} \
	--remote-debugging-port=${chromeRemoteDebugPort} \
	--user-data-dir=${userChromeDataDir} \
	--remote-debugging-address=0.0.0.0 \
	--user-agent="${userAgent}" \
	--start-maximized`;
	console.log("Chrome command:", fullCommand);
	exec(fullCommand, (error, stdout, stderr) => {
		if (stdout) Logger.info(`stdout: ${stdout}`);
		if (stderr) Logger.error(`stderr: ${stderr}`);
		if (error) Logger.error(`exec error: ${error}`);
	});
}

export async function attachToSession() {
	const myChromePath = path.join(
		appDatatDirPath,
		"chromedriver",
		`chromedriver${isWindows ? ".exe" : ""}`
	);
	Logger.info(`Chrome driver path: ${myChromePath}`);
	Logger.info(`User data directory: ${userChromeDataDir}`);

	const service = new chrome.ServiceBuilder(myChromePath)
		.enableVerboseLogging()
		.build();

	const options = new chrome.Options();
	options.options_.debuggerAddress = `localhost:${chromeRemoteDebugPort}`;

	// options.addArguments([
	// 	`--remote-debugging-port=${chromeRemoteDebugPort}`,
	// 	`--user-data-dir=${userChromeDataDir}`,
	// 	"--remote-debugging-address=0.0.0.0",
	// 	`--user-agent=${userAgent}`,
	// 	"--disable-dev-shm-usage",
	// 	"--disable-gpu",
	// 	"--no-sandbox",
	// 	"--headless",
	// ]);
	const driver = chrome.Driver.createSession(options, service);

	return driver;
}

export async function killDriverProcess() {
	// const find = require("find-process");
	const kill = require("kill-port");

	// find("name", "chromedriver")
	// 	.then((list) => {
	// 		list.forEach((p) => {
	// 			ps.kill(p.pid, (e) => {
	// 				if (e) throw e;
	// 				Logger.info(`The ${p.name} process has been killed`);
	// 			});
	// 		});
	// 	})
	// 	.catch((e) => {
	// 		Logger.error(e);
	// 	});

	try {
		await kill(chromeRemoteDebugPort, "tcp");
	} catch (e) {
		Logger.error(e);
	}
}
