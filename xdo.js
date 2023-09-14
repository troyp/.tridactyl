// ╭──────────╮
// │          │
// │  xdo.js  │
// │          │
// ╰──────────╯

const xdo = {
    click: async function(x, y, button=1, opts={}) {
        const xyres = await tri.native.run(
            `xdotool getmouselocation | perl -pe 's/x:(\\d+) y:(\\d+) .*/$1 $2/';`);
        const [x0, y0] = xyres.content.trim().split(" ");
        const excmd = `exclaim_quiet xdotool mousemove ${x} ${y} sleep 0.1 click ${button}`;
        if (opts.return) {
            return tri.controller.acceptExCmd(excmd).then(
                _=>tri.controller.acceptExCmd(`exclaim_quiet xdotool mousemove ${x0} ${y0}`)
            );
        } else
            return tri.controller.acceptExCmd(excmd);
    },

    clickWr: async function(args, opts={}) {
        const [x, y, n] = args.join(" ").trim().split(" ");
        const button = n || 1;
        return this.click(x, y, button, opts);
    },

    /* click item in xdo.coords */
    clickItem: async function(item, button=1, opts={}) {
        return this.click(...this.item(item),  button, opts);
    },

    /* adapted from tridactyl source for ;x in lib/config.ts */
    elem: async function(selector, xdocmd, opts={}) {
        /* xdoelem(selector, xdocmd)
           Hint elements matching selector, move mouse to chosen one, then execute further commands.
           selector: string of arguments to `hint`, may be options and/or selectors (`-c` may be
           omitted if a selector is the initial argument).
           xdocmd: xdotool commands. Optionally, other shell commands may follow, separated by
           semicolons (must be escaped if surrounded by spaces).
        */
        if (selector && !selector.startsWith("-")) selector = "-c " + selector;
        const xyres = await tri.native.run(
            `xdotool getmouselocation | perl -pe 's/x:(\\d+) y:(\\d+) .*/$1 $2/';`);
        const [x, y] = xyres.content.trim().split(" ");
        const excmd = `hint ${selector} -F e => {` +
              "const pos=tri.dom.getAbsoluteCentre(e), dpr=window.devicePixelRatio; tri.native.run(" +
              "`xdotool mousemove ${dpr*pos.x} ${dpr*pos.y};" +
            `xdotool ${xdocmd}` + "`)}";
        if (opts.return) {
            return tri.controller.acceptExCmd(excmd).then(
                _=>tri.controller.acceptExCmd(`exclaim_quiet xdotool mousemove ${x} ${y}`)
            );
        } else
            return tri.controller.acceptExCmd(excmd);
    },
    elemWr: async function(argstr, opts={}) {
        const [selector, xdocmd] = argstr.split(/ +-e +/).map(s=>s.trim());
        return this.elem(selector, xdocmd, opts);
    },

    getMousePos: async function(opts={}) {
        opts = utils.tri.parseOpts(opts, { castBoolean: "yank", });
        opts.type ??= (opts.yank) ? "str" : "array";
        const xyres = await tri.native.run(
            `xdotool getmouselocation | perl -pe 's/x:(\\d+) y:(\\d+) .*/$1 $2/';`
        );
        const xy =  xyres.content.trim();
        const res = (opts.type == "str") ? xy : xy.split(" ");
        if (opts.yank)
            utils.yank(res, { msg: opts.msg });
        else if (opts.msg)
            utils.message(res);
        return res;
    },

    item: function(str) {
        function getItem(obj, str) {
            const [prop, rest] = str.split(".");
            const child = obj[prop];
            if (rest) {
                return getItem(child, rest);
            } else {
                return child;
            }
        }
        return getItem(xdo.coords, str);
    },

    key: async function(k) { return tri.native.run(`xdotool key ${this.resolveKey(k)}`); },

    keyseq: async function(args) {
        const [sleep, ...keys] = utils.tri.parseTerms(args);
        const xdocmd = keys.map(this.resolveKey).map(k => `key ${k}`).join(` sleep ${sleep} `);
        // return utils.msg(xdocmd);
        return tri.native.run("xdotool " + xdocmd);
    },

    omniboxEnter: async function(s) {
        const cmd = `xdotool key alt+d key ctrl+u type "${s} " ; xdotool key Return`;
        const res = await tri.native.run(cmd);
        return res;
    },

    resolveKey: function(k) {
        const components = k.split("+");
        return components.map(c=>xdo.keyAbbrevs[c]||c).join("+");
    },
};

xdo.coords = {
    hamburger_menu:      [ 1896, 85   ],
    tabhist_prev:        [ 260,  85   ],
    tabhist_next:        [ 295,  85   ],
    update_notification: [ 1740, 200  ],
    downloads_menu:      [ 241,  85   ],
    edit_bookmark:       [ 1186, 91   ],
    extension_btn_R1:    [ 1822, 85   ],
    ext_btns: {
        webdev: [1681, 91],
    },
    far_pt:              [ 1919, 1079 ],
};

xdo.keyVars = {
    accel:   "Super_L",
    menuacc: "Alt_L",
};

xdo.keyAbbrevs = {
    accel:  xdo.keyVars.accel,
    menuacc: xdo.keyVars.menuacc,
    "↵"  : "Return",   /* digraph <| */
    "↩"  : "Return",
    "←"  : "Left",     /* digraph <- */
    "→"  : "Right",    /* digraph -> */
    "↓"  : "Down",     /* digraph -v */
    "↑"  : "Up",       /* digraph !- */
};

window.xdo = xdo;
