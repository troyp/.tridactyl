// ╭─────────────╮
// │             │
// │  jsload.js  │
// │             │
// ╰─────────────╯

const jsload = async function (opts="") {
    [single_letter_optstr, ...long_opts] = opts.split(",");
    single_letter_optstr.split("").forEach(async c => {
        switch(c) {
          case "a":
              await tri.controller.acceptExCmd("js -r capps.js");
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
