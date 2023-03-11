// ╭─────────────╮
// │             │
// │  jsload.js  │
// │             │
// ╰─────────────╯

/**
 * jsload("opts...")
 * Load js files into content script. Takes a single string consisting of
 * zero or more single letter short-options, optionally followed by long
 * options separated by commas
 *     a  -  capps
 *     l  -  links
 *     p  -  js/sprintf
 *     s  -  shell
 *     S  -  S
 *     u  -  cutils
 *     U  -  urls
 */
const jsload = async function (opstr="") {
    if (opstr.includes("a")) await tri.excmds.js("-r", "capps.js");
    if (opstr.includes("c")) await tri.excmds.js("-r", "csites.js");
    if (opstr.includes("l")) await tri.excmds.js("-r", "links.js");
    if (opstr.includes("p")) await tri.excmds.js("-r", "js/sprintf.js");
    if (opstr.includes("s")) await tri.excmds.js("-r", "shell.js");
    if (opstr.includes("S")) await tri.excmds.js("-r", "S.js");
    if (opstr.includes("u")) await tri.excmds.js("-r", "cutils.js");
    if (opstr.includes("U")) await tri.excmds.js("-r", "urls.js");
};

window.jsload = jsload;
