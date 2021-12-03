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
        if (!("prefix" in opts)) opts.prefix = "Copied: ";
        this.message(s, opts);
    },

};

// ───────────────────────────────────────────────────────────────────────────────
// ╭─────────────────────────────╮
// │ utils.tab -- tabs utilities │
// ╰─────────────────────────────╯

utils.tab = {
    getAll: async function(opts={}) {
        if (! ("currentWindow" in opts)) opts.currentWindow = true;
        return ( await browser.tabs.query(opts) );
    },

    getNumber: async function(opts={}) {
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
        var N = await this.getNumber();
        var n = (tabnum-1).mod(N) + 1;
        browser.tabs.query({currentWindow: true, tabnum: n-1}).then(
            tt=> browser.tabs.update(tt[0].id, { active: true })
        );
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
};

window.utils = utils;
