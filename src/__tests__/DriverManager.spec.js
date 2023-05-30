import fs from "fs";

import { downloadChromeDriver } from "../main/applier/driver/Manager";
import OS from "../main/applier/lib/OS";

test("downloadChromeDriver() downloads chrome driver", async () => {
	if (fs.existsSync(OS.chromeDriverPath)) {
		console.log("Removing chrome driver");
		fs.unlinkSync(OS.chromeDriverPath);
	}
	expect(fs.existsSync(OS.chromeDriverPath)).toBeFalsy();
	await downloadChromeDriver();
	await new Promise((resolve) => setTimeout(resolve, 10000));
	expect(fs.existsSync(OS.chromeDriverPath)).toBeTruthy();
});
