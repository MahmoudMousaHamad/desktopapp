const path = require("path");
const os = require("os");

const platform = os.platform();

let isWindows = false;
let targetPlatform;
let appDatatDirPath;

switch (platform) {
	case "darwin":
		targetPlatform = os.cpus()[0].model.includes("Apple")
			? "mac64_m1"
			: "mac64";
		appDatatDirPath = path.join(
			process.env.HOME,
			"Library",
			"Application Support",
			"JobApplier"
		);
		break;
	case "linux":
		targetPlatform = "linux64";
		appDatatDirPath = path.join(process.env.HOME, ".JobApplier");
		break;
	case "win32":
		targetPlatform = "win32";
		appDatatDirPath = path.join(process.env.APPDATA, "JobApplier");
		isWindows = true;
		break;
	default:
		throw Error("Unknown OS platform");
}

console.log("Target platform", targetPlatform);
console.log("appDatatDirPath", appDatatDirPath);

module.exports = {
	targetPlatform,
	appDatatDirPath,
	isWindows,
};
