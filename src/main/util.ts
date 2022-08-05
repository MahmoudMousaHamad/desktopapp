/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import url, { URL } from "url";
import path from "path";

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
