import fs from "fs";

import { downloadChromeDriver } from "../main/driver/Manager";
import { chromeDriverPath } from "../main/lib/OS";

test("downloadChromeDriver() downloads chrome driver", async () => {
	if (fs.existsSync(chromeDriverPath)) {
		fs.unlinkSync(chromeDriverPath);
	}
	expect(fs.existsSync(chromeDriverPath)).toBeFalsy();
	await downloadChromeDriver();
	await new Promise((resolve) => setTimeout(resolve, 10000));
	expect(fs.existsSync(chromeDriverPath)).toBeTruthy();
});
