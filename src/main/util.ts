/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import url, { URL } from "url";
import path from "path";
import fs from "fs";

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
    // console.log(
    //   "Renderer path and files:",
    //   path.resolve(__dirname, "../renderer/")
    // );
    // fs.readdirSync(path.resolve(__dirname, "../renderer/")).forEach((file) => {
    //   console.log(file);
    // });
    // console.log("Production url:", myurl);
    return myurl;
    // return `file://${path.resolve(__dirname, "../renderer/", htmlFileName)}`;
  };
}
