import winston from "winston";
import path from "path";

import OS from "./OS";

function initLogger() {
	console.log("appDatatDirPath", OS.appDatatDirPath);
	const Logger = winston.createLogger({
		level: "info",
		format: winston.format.json(),
		transports: [
			new winston.transports.File({
				filename: path.resolve(OS.appDatatDirPath, "./error.log"),
				level: "error",
			}),
			new winston.transports.File({
				filename: path.resolve(OS.appDatatDirPath, "./combined.log"),
			}),
		],
	});

	if (process.env.NODE_ENV !== "production") {
		Logger.add(
			new winston.transports.Console({
				level: "info",
				format: winston.format.simple(),
			})
		);
	}

	return Logger;
}

const Logger = initLogger();

export default Logger;
