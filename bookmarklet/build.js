#!/usr/bin/env node
// Regenerate the bookmarklet href in install.html from bookmarklet.js.
// Usage:  node bookmarklet/build.js
//    or:  ./bookmarklet/build.js   (after chmod +x)

const fs = require("fs");
const path = require("path");

const dir = __dirname;
const srcPath = path.join(dir, "bookmarklet.js");
const htmlPath = path.join(dir, "install.html");

let src = fs.readFileSync(srcPath, "utf8");
src = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const href = "javascript:" + encodeURIComponent(src);

try {
    new Function(decodeURIComponent(href.slice("javascript:".length)));
} catch (e) {
    console.error("Generated bookmarklet does not parse:", e.message);
    process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf8");
const re = /(<a class="install" href=")[^"]*(")/;
if (!re.test(html)) {
    console.error("Could not find <a class=\"install\" href=\"...\"> in install.html");
    process.exit(1);
}
fs.writeFileSync(htmlPath, html.replace(re, (_m, a, b) => a + href + b));

console.log(`OK — ${href.length} chars written to install.html`);
