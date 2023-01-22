/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import url, { URL } from "url";
import path from "path";
import http from "http";

export let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === "development") {
	const port = process.env.PORT || 1212;
	resolveHtmlPath = (htmlFileName: string) => {
		const htmlUrl = new URL(`http://localhost:${port}`);
		htmlUrl.pathname = htmlFileName;
		return htmlUrl.href;
	};
} else {
	resolveHtmlPath = (htmlFileName: string) => {
		const myurl = url.format({
			pathname: path.resolve(__dirname, "../renderer/", htmlFileName),
			protocol: "file:",
			slashes: true,
		});
		return myurl;
	};
}

export class LoopbackRedirectServer {
	maybeRedirection: Promise<string>;

	server?: http.Server;

	constructor(
		port: string | number,
		successRedirectURL: string,
		callbackPath: string
	) {
		this.maybeRedirection = new Promise((resolve, reject) => {
			this.server = http.createServer((req, res) => {
				if (req.url && url.parse(req.url).pathname === callbackPath) {
					res.writeHead(302, {
						Location: successRedirectURL,
					});
					res.end();
					resolve(url.resolve(`http://127.0.0.1:${port}`, req.url));
					this.server?.close();
				} else {
					res.writeHead(404);
					res.end();
				}
			});
			this.server.on("error", (e) => reject(e));
			this.server.listen(port);
		});
	}

	/**
	 * Will resolve with the exact reached callback URL that contains the Authorization code.
	 */
	waitForRedirection() {
		return this.maybeRedirection;
	}

	close() {
		return new Promise((resolve) => this.server?.close(resolve));
	}
}
exports.default = LoopbackRedirectServer;
