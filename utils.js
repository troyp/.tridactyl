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

    /* adapted from tridactyl source for ;x in lib/config.ts */
    xdoelem: async function(selector, xdocmd) {
        /* xdoelem(selector, xdocmd)
             Move mouse to first element matching selector, then execute further commands.
             selector: string of arguments to `hint`, may be options and/or selectors (`-c` may be
                 omitted if a selector is the initial argument).
             xdocmd: xdotool commands. Optionally, other shell commands may follow, separated by
                 semicolons (must be escaped if surrounded by spaces).
        */
        if (!selector.startsWith("-")) selector = "-c " + selector;
        const excmd = `hint ${selector} -F e => {` +
            "const pos=tri.dom.getAbsoluteCentre(e), dpr=window.devicePixelRatio; tri.native.run(" +
            "`xdotool mousemove ${dpr*pos.x} ${dpr*pos.y};" +
            `xdotool ${xdocmd}` + "`)}";
        return tri.controller.acceptExCmd(excmd);
    },
    xdoelemWrapper: async function(argstr) {
        const [selector, xdocmd] = argstr.split(/ +-e +/).map(s=>s.trim());
        return this.xdoelem(selector, xdocmd);
    },

    yankWithMsg: function(s, opts={}) {
        tri.excmds.yank(s);
        opts.prefix ??= "Copied: ";
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

    getAlternate: async function(n=1) {
        n = parseInt(n);
        var sorted = await this.sortedByAccess();
        return sorted[n];
    },

    getid: async function(tabnum, opts={}) {
        var t = await this.get(tabnum-1, opts);
        return t.id;
    },

    getAll: async function(opts={}) {
        opts.currentWindow ??= true;
        return ( await browser.tabs.query(opts) );
    },

    getN: async function(opts={}) {
        return this.getAll(opts).then(tt => tt.length);
    },

    open: async function(url, opts={}) {
        /*   open(URL, { OPTIONS... })
         *   open(URL, WHERE)
         * opts.where ["here" (default), "related", "next", "last"]: where to open new tab (if any)
         * opts.background: don't switch to new tab
         */
        if (typeof opts == "string") opts = {where: opts};
        var thisTab = await tri.webext.activeTab();
        var legal = url.match(/^https?:'/);
        /* can't open special URLs in current tab */
        if (!legal && opts.where==="here") opts.where="next";
        var initurl = legal ? url : "https://google.com";
        var active = !opts.background;
        var newTab;
        /* https?: URLs */
        if (legal) {
            switch (opts.where) {
              case "last":
                  var N = await this.getN();
                  newTab = await this.tabCreateWrapper(initurl, {active: active, index: N-1});
                  break;
              case "related":
                  newTab = await tri.webext.openInNewTab(initurl, {active: active, related: true});
                  break;
              case "next":
                  var i = thisTab.index;
                  newTab = await tri.webext.openInNewTab(initurl, {active: active, related: true, index: i+1});
                  break;
              case "here":
              default:
                  newTab = thisTab;
                  await tri.controller.acceptExCmd(`open ${url}`);
            }
        } else {
            /* special URLs */
            if (opts.where=="last" && opts.background)
                await tri.controller.acceptExCmd(`tabopen -b ${url}`);
            else
                await tri.controller.acceptExCmd(`tabopen ${url}`);
            /* TODO: identify correct tab using .url and .lastAccessed properties */
            /* currently assumes last tab (ie. tabopenpos == "last") */
            var tt = await this.getAll();
            newTab = tt.slice(-1)[0];
            var i = thisTab.index;
            if (["related", "next"].includes(opts.where)) {
                /* TODO: handle related separately */
                /* TODO: don't set alternate tab */
                if (opts.background)
                    await browser.tabs.move(newTab.id, {index: i+1}).then(t=>this.switch(thisTab.index+1));
                else
                    await browser.tabs.move(newTab.id, {index: i+1});
            } else if (opts.where=="last" && opts.background) {
                await this.switch(thisTab.index+1);
            }
        }
        return newTab;
    },

    openOrSummon: async function(url, opts={}) {
        /*
         * opts.where ["last" (default), "here", "related", "next"]: where to open new tab (if any)
         * opts.regex: regex to test if existing tab qualifies
         * opts.reload: whether to reload existing tab
         * opts.background: whether to leave new/summoned tab in background, or make active
         */
        if (!url) return null;
        if (typeof opts == "string") opts = {where: opts};
        var currentTab = await tri.webext.activeTab();
        var alltabs = await this.getAll();
        var testfn = opts.regex ? (t=> t.url.match(opts.regex)) : (t=> t.url.indexOf(url)>=0);
        var existingTab = alltabs.find(testfn);
        if (existingTab) {
            if (opts.reload) await browser.tabs.reload(existingTab.id);
            await this.summon(existingTab.index+1, {background: opts.background, delta: opts.delta||1});
            return existingTab;
        } else return this.open(url, {where: opts.where||"related", background: opts.background});
    },


    openOrSwitch: async function (url, opts={}) {
        /*   openOrSwitch(URL, { OPTIONS... })
         *   openOrSwitch(URL, WHERE)
         * opts.where ["last" (default), "here", "related", "next"]: where to open new tab (if any)
         * opts.regex: regex to test if existing tab qualifies
         * opts.reload: whether to reload existing tab
         * opts.closeCurrent [default: true if where=="here"]: whether to close current tab
         */
        if (!url) return null;
        if (typeof opts == "string") opts = {where: opts};
        opts.closeCurrent ??= (opts.where=="here");
        var currentTab = await tri.webext.activeTab();
        var alltabs = await this.getAll();
        var testfn = opts.regex ? (t=> t.url.match(opts.regex)) : (t=> t.url.indexOf(url)>=0);
        var existingTab = alltabs.find(testfn);
        if (existingTab) {
            return this.switch(existingTab.index+1).then(async ()=>{
                if (opts.closeCurrent) await browser.tabs.remove(currentTab.id);
                if (opts.reload) await browser.tabs.reload(existingTab.id);
                return existingTab;
            });
        } else return this.open(url, {where: opts.where||"related"});
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

    /* Returns 0-based index of tab(s) chosen */
    rofiChoose: async function (opts={}) {
        opts.prompt ??= "Select tabs (S-Enter): ";
        opts.format ||= "i";
        var alltabs = await this.getAll();
        const formatter = (t,i)=>sprintf("%-3d  %-40s    <%s>", i+1, S.ellipsize(t.title, 40), t.url);
        var alltabsitems = alltabs.map(formatter);
        var dmenuInput = alltabsitems.join("\n");
        var cmd = `dmenuin="$(cat <<'EOF'\n${dmenuInput}\nEOF\n)"; echo "$dmenuin" | rofi -dmenu -width 80 -format ${opts.format} -p "${opts.prompt}" -multi-select -i`;
        return tri.native.run(cmd).then(
            res => res.content.trim().split("\n")
        );
    },

    rofiChooseByRegex: async function (opts={}) {
        opts.prompt ??= "Construct regex [enter]: ";
        var alltabs = await this.getAll();
        const formatter = (t,i)=>sprintf("%-3d  %-40s    <%s>", i+1, S.ellipsize(t.title, 40), t.url);
        var alltabsitems = alltabs.map(formatter);
        var dmenuInput = alltabsitems.join("\n");
        var cmd = `dmenuin="$(cat <<'EOF'\n${dmenuInput}\nEOF\n)"; echo "$dmenuin" | rofi -dmenu -width 80 -regex -format f -p "${opts.prompt}" -i`;
        return tri.native.run(cmd).then(
            res => alltabs.filter(t=>t.url.match(res.content.trim()))
        );
    },

    sortedByAccess: async function() {
        var tabs = await browser.tabs.query({currentWindow: true});
        return tabs.sort((t1,t2) => t2.lastAccessed-t1.lastAccessed);
    },

    switch: async function(tabnum) {
        if (tabnum=="$") tabnum = 0; else tabnum = Number(tabnum);
        var N = await this.getN();
        var n = (tabnum-1).mod(N) + 1;
        browser.tabs.query({currentWindow: true, index: n-1}).then(
            tt=> browser.tabs.update(tt[0].id, { active: true })
        );
    },

    switchAlternate: async function(n=1, opts={}) {
        const thisTab = await tri.webext.activeTab();
        const alt = await this.getAlternate(n);
        if (opts.removeCurrent) browser.tabs.remove(thisTab.id);
        return browser.tabs.update(alt.id, {active: true});
    },

    summonAlternate: async function(n=1, opts={}) {
        const thisTab = await tri.webext.activeTab();
        const alt = await this.getAlternate(n);
        const d = opts.delta || 1;
        var d_adj;
        if (d > 0)
            d_adj = (alt.index < thisTab.index) ? d-1 : d;
        else
            d_adj = (alt.index < thisTab.index) ? d : d+1;
        return browser.tabs.move(alt.id, {index: thisTab.index+d_adj});
    },


    summon: async function(tabnum, opts={}) {
        if (tabnum=="$") tabnum = 0; else tabnum = Number(tabnum);
        const N = await this.getN();
        const n = (tabnum-1).mod(N) + 1;
        const thisTab = await tri.webext.activeTab();
        const d = opts.delta || 1;
        var d_adj;
        if (d > 0)
            d_adj = (tabnum <= thisTab.index) ? d-1 : d;
        else
            d_adj = (tabnum <= thisTab.index) ? d : d+1;
        const tt = await browser.tabs.query({currentWindow: true, index: n-1});
        const t = tt[0];
        await browser.tabs.move(t.id, {index: thisTab.index+d_adj});
        if (!opts.background) await browser.tabs.update(t.id, { active: true });
        return t;
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

    myfocusinput: function(arg) { var n = Number(arg)||"-l"; tri.excmds.focusinput(n); },
};

// ───────────────────────────────────────────────────────────────────────────────

window.utils = utils;
