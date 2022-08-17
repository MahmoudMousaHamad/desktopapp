const winston = require("winston");
const path = require("path");

const { appDatatDirPath } = require("./OSHelper");

function initLogger() {
	console.log("appDatatDirPath", appDatatDirPath);
	const Logger = winston.createLogger({
		level: "info",
		format: winston.format.json(),
		transports: [
			new winston.transports.File({
				filename: path.resolve(appDatatDirPath, "./error.log"),
				level: "error",
			}),
			new winston.transports.File({
				filename: path.resolve(appDatatDirPath, "./combined.log"),
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
