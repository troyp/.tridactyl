// ╭─────────────────────────────────────────────╮
// │ utils -- utility functions for .tridactylrc │
// ╰─────────────────────────────────────────────╯

var utils = {
    message: function(s, opts={}) {
        var s_ = (opts.prefix || "") + s;
        if (opts.temp) {
            let t = opts.duration || 3000;
            tri.excmds.fillcmdline_tmp(s_, t);
        } else {
            tri.excmds.fillcmdline_nofocus(s_);
        }
        return s;
    },

    yankWithMsg: function(s, opts={}) {
        tri.excmds.yank(s);
        opts.prefix = opts.prefix ?? "Copied: ";
        this.message(s, opts);
    },
};

// ───────────────────────────────────────────────────────────────────────────────
// ╭─────────────────────────────╮
// │ utils.tab -- tabs utilities │
// ╰─────────────────────────────╯

utils.tab = {
    get: async function(tabnum, opts={}) {
        var res = await browser.tabs.query({index: tabnum-1});
        return res[0];
    },

    getid: async function(tabnum, opts={}) {
        var t = await this.get(tabnum-1, opts);
        return t.id;
    },

    getAll: async function(opts={}) {
        if (! ("currentWindow" in opts)) opts.currentWindow = true;
        return ( await browser.tabs.query(opts) );
    },

    getN: async function(opts={}) {
        return this.getAll(opts).then(tt => tt.length);
    },

    remove: async function(pred) {
        const tabs = await browser.tabs.query({pinned: false, currentWindow: true});
        const atab = await activeTab();
        const ids = tabs.filter(pred).map(tab => tab.id);
        return browser.tabs.remove(ids);
    },
    filter: function(pred) {
        return tab.remove(!pred);
    },

    switch: async function(tabnum) {
        if (tabnum=="$") tabnum = 0; else tabnum = Number(tabnum);
        var N = await this.getN();
        var n = (tabnum-1).mod(N) + 1;
        browser.tabs.query({currentWindow: true, tabnum: n-1}).then(
            tt=> browser.tabs.update(tt[0].id, { active: true })
        );
    },

    /* Returns 0-based index of tab(s) chosen */
    rofiChoose: async function (prompt="Select tabs (S-Enter): ") {
        var alltabs = await this.getAll();
        var alltabsitems = alltabs.map((t, i)=>`${i+1}: ${t.label}    <${t.url}>`);
        var dmenuInput = alltabsitems.join("\n");
        var cmd = `dmenuin="$(cat <<'EOF'\n${dmenuInput}\nEOF\n)"; echo "$dmenuin" | rofi -dmenu -format i -p "${prompt}" -multi-select -i`;
        return tri.native.run(cmd).then(
            res => res.content.trim().split("\n")
        );
    },

    rofiChooseByRegex: async function (prompt="Construct regex [enter]: ") {
        var alltabs = await this.getAll();
        var alltabsitems = alltabs.map((t, i)=>`${i+1}: ${t.label}    <${t.url}>`);
        var dmenuInput = alltabsitems.join("\n");
        var cmd = `dmenuin="$(cat <<'EOF'\n${dmenuInput}\nEOF\n)"; echo "$dmenuin" | rofi -dmenu -regex -format f -p "${prompt}" -i`;
        return tri.native.run(cmd).then(
            res => alltabs.filter(t=>t.url.match(res.content.trim()))
        );
    },

    /* taken from tridactyl src/lib/webext.ts -- author: Oliver Blanthorn */
 	  tabCreateWrapper: async function (options) {
        const tab = await browserBg.tabs.create(options);
        const answer = new Promise(resolve => {
            /* can't run in content scripts */
            browserBg.runtime.onMessage.addListener((message, sender) => {
                if (message !== "dom_loaded_background" || sender?.tab?.id !== tab.id) return;
                browserBg.runtime.onMessage.removeListener(listener);
                resolve(tab);
            });
        });
        /* Return on slow- / extremely quick- loading pages anyway */
        return Promise.race([answer, (async () => {await sleep(750); return tab;})(),]);
    },
};

// ───────────────────────────────────────────────────────────────────────────────
// ╭─────────────────────────────────────────────────────────────────╮
// │ utils.tri -- utilities related to tridactyl source and features │
// ╰─────────────────────────────────────────────────────────────────╯

utils.tri = {
    gotoCommandSource: function(s) {
        var repo = "~/source/git-repos/tridactyl";
        var cmd = `grep -inP 'export (async )?function ${s}[(]' ${repo}/src/excmds.ts`;
        tri.native.run(cmd).then(
            l=> {
                var n = parseInt(l.content);
                var url = `https://github.com/tridactyl/tridactyl/blob/master/src/excmds.ts#L${n}`;
                return tri.excmds.tabopen(url);
            }
        );
    },

    myfocusinput(arg) { var n = Number(arg)||"-l"; tri.excmds.focusinput(n); }
};

// ───────────────────────────────────────────────────────────────────────────────

window.utils = utils;
