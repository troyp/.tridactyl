// ╭─────────────╮
// │             │
// │  jsload.js  │
// │             │
// ╰─────────────╯

/**
 * jsload("shortopts,longopt1,longopt2,...")
 * Load js files into content script. Takes a single string consisting of
 * zero or more single letter short-options, optionally followed by long
 * options separated by commas
 *   Short opts:
 *     a  -  capps
 *     l  -  links
 *     p  -  js/sprintf
 *     s  -  sites
 *     S  -  S
 *     u  -  cutils
 *     U  -  urls
 */
const jsload = async function (opts="") {
    [single_letter_optstr, ...long_opts] = opts.split(",");
    single_letter_optstr.split("").forEach(async c => {
        switch(c) {
          case "a":
              await tri.controller.acceptExCmd("js -r capps.js");
              break;
          case "c":
              await tri.controller.acceptExCmd("js -r csites.js");
              break;
          case "l":
              await tri.controller.acceptExCmd("js -r links.js");
              break;
          case "p":
              await tri.controller.acceptExCmd(`js -r js/sprintf.js`);
              break;
          case "s":
              await tri.controller.acceptExCmd("js -r sites.js");
              break;
          case "S":
              await tri.controller.acceptExCmd(`js -r S.js`);
              break;
          case "u":
              await tri.controller.acceptExCmd("js -r cutils.js");
              break;
          case "U":
              await tri.controller.acceptExCmd("js -r urls.js");
              break;
        }
    });
    long_opts.forEach(async rel => await tri.controller.acceptExCmd(`js -r ${rel}.js`));
};

window.jsload = jsload;
