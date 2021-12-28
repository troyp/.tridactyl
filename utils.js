// ╭─────────────────────────────────────────────╮
// │ utils -- utility functions for .tridactylrc │
// ╰─────────────────────────────────────────────╯

var utils = {
    cbread: async function (index=0, options={}) {
        const s = ( index )
              ? (await tri.native.run(`copyq read ${index}`)).content
              : await tri.native.clipboard("get");
        return options.notrim ? s : s.trim();
    },

    message: function(s, opts={}) {
        const s_ = (opts.prefix || "") + s;
        if (opts.temp) {
            const t = opts.duration || 3000;
            tri.excmds.fillcmdline_tmp(s_, t);
        } else if (opts.useAlert) {
            this.messageBox(s_.split("\n"), opts);
        } else {
            tri.excmds.fillcmdline_nofocus(s_);
        }
        return s;
    },

    messageBox: async function(lines, opts={}) {
        if (!Array.isArray(lines)) lines = [lines];
        const w = parseInt(opts.width) || 50;
        const indent = opts.contPrefix || "";
        const d = indent.length;
        var line, s = "";
        for (line of lines.map(String)) {
            s += line.substring(0, w) + "\n";
            line = line.slice(w);
            while (line!=="") {
                s += indent + line.substring(0, w-d) + "\n";
                line = line.slice(w-d);
            }
        }
        const s_ = s
              .replace(/\n/g, "\\n")
              .replace(/\t/g, "\\t")
              .replace(/'/g, "\\'")
              .replace(/ /g, "\\ ");
        tri.controller.acceptExCmd(`js alert('${s_}')`);
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
        if (selector && !selector.startsWith("-")) selector = "-c " + selector;
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
        var defaultPrefix = "Copied" + (opts.useAlert ? "...\n" : ": ");
        opts.prefix ??= defaultPrefix;
        this.message(s, opts);
    },
};

// ───────────────────────────────────────────────────────────────────────────────
// ╭─────────────────────────────╮
// │ utils.tab -- tabs utilities │
// ╰─────────────────────────────╯

utils.tab = {
    filter: function(pred) {
        return tab.remove(!pred);
    },

    get: async function(tabnum, opts={}) {
        const res = await browser.tabs.query({index: tabnum-1});
        return res[0];
    },

    getAll: async function(opts={}) {
        opts.currentWindow ??= true;
        return ( await browser.tabs.query(opts) );
    },

    getAlternate: async function(n=1) {
        n = parseInt(n);
        const sorted = await this.sortedByAccess();
        return sorted[n];
    },

    getid: async function(tabnum, opts={}) {
        const t = await this.get(tabnum-1, opts);
        return t.id;
    },

    getPinned: async function() {
        return browser.tabs.query({currentWindow: true, pinned: true});
    },

    getN: async function(opts={}) {
        return this.getAll(opts).then(tt => tt.length);
    },

    /* Move current tab to TABNUM. If TABNUM is a pinned tab, move to first nonpinned position
     */
    move: async function(tabnum=0) {
        const thisTab = await tri.webext.activeTab();
        const targetIdx = await this.parseTabnum(tabnum);
        const nPinned = (await this.getPinned()).length;
        const i = thisTab.pinned ? Math.min(targetIdx, nPinned-1) : Math.max(targetIdx, nPinned);
        return browser.tabs.move(thisTab.id, {index: i});
    },

    open: async function(url, opts={}) {
        /*   open(URL, { OPTIONS... })
         *   open(URL, WHERE)
         * opts.where ["here" (default), "related", "next", "last"]: where to open new tab (if any)
         * opts.background: don't switch to new tab
         */
        opts = utils.tri.parseOpts(opts, {castString: "where"});
        if (typeof opts == "string") opts = {where: opts};
        const thisTab = await tri.webext.activeTab();
        const legal = url.match(/^https?:/);
        /* can't open special URLs in current tab */
        if (!legal && opts.where==="here") opts.where="next";
        const initurl = legal ? url : "https://google.com";
        const active = !opts.background;
        var newTab;
        /* https?: URLs */
        if (legal) {
            switch (opts.where) {
              case "last":
                  const N = await this.getN();
                  newTab = await this.tabCreateWrapper({url: initurl, active: active, index: N});
                  break;
              case "related":
                  newTab = await tri.webext.openInNewTab(initurl, {active: active, related: true});
                  break;
              case "next":
                  const i = thisTab.index;
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
            const tt = await this.getAll();
            newTab = tt.slice(-1)[0];
            const i = thisTab.index;
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
         * opts.where ["here", "related" (default), "next"]: where to open new tab (if any)
         * opts.regex: regex to test if existing tab qualifies
         * opts.reload: whether to reload existing tab
         * opts.background: whether to leave new/summoned tab in background, or make active
         * opts.closeCurrent [default: true if where=="here"]: whether to close current tab
         */
        if (!url) return null;
        opts = utils.tri.parseOpts(opts, {castString: "where", nullishDefaults:{where:"here"}});
        const currentTab = await tri.webext.activeTab();
        const testfn = opts.regex ? (t=> t.url.match(opts.regex)) : (t=> t.url.indexOf(url)>=0);
        if (testfn(currentTab)) return currentTab;
        else  {
            const alltabs = await this.getAll();
            const existingTab = alltabs.find(testfn);
            if (existingTab) {
                const targetIdx = (where=="here") ? existingTab.index : existingTab.index+1;
                if (opts.reload) await browser.tabs.reload(existingTab.id);
                await this.summon(targetIdx, {background: opts.background, delta: opts.delta||1});
                if (opts.closeCurrent) await browser.tabs.remove(currentTab.id);
                return existingTab;
            } else return this.open(url, {where: opts.where, background: opts.background});
        }
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
        const currentTab = await tri.webext.activeTab();
        const testfn = opts.regex ? (t=> t.url.match(opts.regex)) : (t=> t.url.indexOf(url)>=0);
        if (testfn(currentTab)) return currentTab;
        else {
            const alltabs = await this.getAll();
            const existingTab = alltabs.find(testfn);
            if (existingTab) {
                return this.switch(existingTab.index+1).then(async ()=>{
                    if (opts.closeCurrent) await browser.tabs.remove(currentTab.id);
                    if (opts.reload) await browser.tabs.reload(existingTab.id);
                    return existingTab;
                });
            } else return this.open(url, {where: opts.where||"related"});
        }
    },

    parseTabnum: async function(n) {
        const N = await this.getN();
        switch(n) {
          case "$":
          case "0":
              n = N;
              break;
          case "^":
              n = 1;
              break;
          case "#":
              const alt = await this.getAlternate();
              n = alt.index+1;
              break;
          case "%":
          case ".":
              const thisTab = await tri.webext.activeTab();
              n = thisTab.index+1;
              break;
        }
        return (parseInt(n)-1) % N;
    },

    remove: async function(pred) {
        const tabs = await browser.tabs.query({pinned: false, currentWindow: true});
        const atab = await activeTab();
        const ids = tabs.filter(pred).map(tab => tab.id);
        return browser.tabs.remove(ids);
    },

    /* Returns 0-based index of tab(s) chosen */
    rofiChoose: async function (opts={}) {
        opts.prompt ??= "Select tabs (S-Enter): ";
        opts.format ||= "i";
        const alltabs = await this.getAll();
        const formatter = (t,i)=>sprintf("%-3d  %-40s    <%s>", i+1, S.ellipsize(t.title, 40), t.url);
        const alltabsitems = alltabs.map(formatter);
        const dmenuInput = alltabsitems.join("\n");
        const cmd = `dmenuin="$(cat <<'EOF'\n${dmenuInput}\nEOF\n)"; echo "$dmenuin" | rofi -dmenu -width 80 -format ${opts.format} -p "${opts.prompt}" -multi-select -i`;
        return tri.native.run(cmd).then(
            res => res.content.trim().split("\n").map(Number)
        );
    },

    rofiChooseByRegex: async function (opts={}) {
        opts.prompt ??= "Construct regex [enter]: ";
        const alltabs = await this.getAll();
        const formatter = (t,i)=>sprintf("%-3d  %-40s    <%s>", i+1, S.ellipsize(t.title, 40), t.url);
        const alltabsitems = alltabs.map(formatter);
        const dmenuInput = alltabsitems.join("\n");
        const cmd = `dmenuin="$(cat <<'EOF'\n${dmenuInput}\nEOF\n)"; echo "$dmenuin" | rofi -dmenu -width 80 -regex -format f -p "${opts.prompt}" -i`;
        return tri.native.run(cmd).then(
            res => alltabs.filter(t=>t.url.match(res.content.trim()))
        );
    },

    sortedByAccess: async function() {
        const tabs = await browser.tabs.query({currentWindow: true});
        return tabs.sort((t1,t2) => t2.lastAccessed-t1.lastAccessed);
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

    switch: async function(tabnum) {
          if (tabnum=="$") tabnum = 0; else tabnum = Number(tabnum);
          const N = await this.getN();
          const n = (tabnum-1).mod(N) + 1;
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

    /* cmdYankHistory :: number|string|array -> IO string
     */
    cmdYankHistory: function(args) {
        if (["number","string"].includes(typeof args)) args = [args];
        const ns = args.map(n=>Number(n)||1);
        const hist = tri.state.cmdHistory;
        const N = hist.length;
        const cmds = ns.map(n=>hist[N-n]);
        return utils.yankWithMsg(cmds.join("\n"));
    },

    cmdYankHistoryLastN: function(n) {
        n = Number(n)||1;
        const cmds = tri.state.cmdHistory.slice(-n);
        return utils.yankWithMsg(cmds.join("\n"));
    },

    docBindMode: function(args) {
        const argstr = args.join(" ").trim();
        const bindmodeRe = /^([a-z]+) ([^ ]+) "([^"]*)" (.*)/;
        const match = argstr.match(bindmodeRe);
        [mode, key, desc, rest] = match.slice(1);
        /* TODO: implement documentation system */
        /* for now, extract descriptions statically from file */
        if (mode=="i") {
            tri.controller.acceptExCmd(`bind --mode=insert ${key} ${rest}`);
            tri.controller.acceptExCmd(`bind --mode=input ${key} ${rest}`);
        } else {
            tri.controller.acceptExCmd(`bind --mode=${mode} ${key} ${rest}`);
        }
    },

    docBindUrl: function(args) {
        const argstr = args.join(" ").trim();
        const bindurlRe = /^([^ ]+) ([^ ]+) "([^"]*)" (.*)/;
        const [site, key, desc, rest] = argstr.match(bindurlRe).slice(1);
        tri.controller.acceptExCmd(`bindurl ${site} ${key} ${rest}`);
    },

    docdef: function(args) {
        const argstr = args.join(" ").trim();
        const docdefRe = /^([a-zA-Z_!:]+) ([^ ]+) "([^"]*)" (.*)/;
        const match = argstr.match(docdefRe);
        [defCmd, key, desc, rest] = match.slice(1);
        /* TODO: implement documentation system */
        /* for now, extract descriptions statically from file */
        tri.controller.acceptExCmd(`${defCmd} ${key} ${rest}`);
    },


    gotoCommandSource: function(s) {
        const repo = "~/source/git-repos/tridactyl";
        const cmd = `grep -inP 'export (async )?function ${s}[(]' ${repo}/src/excmds.ts`;
        tri.native.run(cmd).then(
            l=> {
                const n = parseInt(l.content);
                const url = `https://github.com/tridactyl/tridactyl/blob/master/src/excmds.ts#L${n}`;
                return tri.excmds.tabopen(url);
            }
        );
    },

    generateMarkBindings: async function(markPref="m", gotoMarkPref="'") {
        tri.R.range(97,123).
            map(i=>String.fromCharCode(i)).
            forEach(c=>{
                tri.excmds.bind(gotoMarkPref+c, `js window.scrollTo(0,window._tri_reg_${c})`);
                tri.excmds.bind(markPref+c, `js window._tri_reg_${c}=window.scrollY`);
            });
    },

    myfocusinput: function(arg) { const n = arg ? Number(arg)-1 : "-l"; tri.excmds.focusinput(n); },

    parseArgs: function(args, opts={}) {
        opts = this.parseOpts(opts, {castString: "type"});
        const argstr = args.join(" ").trim();
        switch (opts.type) {
          case "string":
              return argstr; break;
          case "number":
              return Number(argstr) || null;
          case "array":
          default:
              return argstr.split(/ +/); break;
        }
    },

    parseArgsAndCount: function(args, opts={}) {
        const n = args.length - 1;
        const hasCount = parseInt(args[n]) > 0;
        const countElem = hasCount && args.pop();
        const count = countElem && parseInt(countElem);
        return [this.parseArgs(args, opts), count];
    },

    /** options.castString:               if a string is passed for opts rather than an array, it
     *                                    represents the value of the property opts[options.castString].
     *  options.defaults.key=val:         if key if falsey, set to value
     *  options.nullishDefaults.key=val:  if key is nullish, set to value
     */
    parseOpts: function(opts, options={}) {
        if (options.castString && typeof opts == "string") {
            const opts_ = {};
            opts_[options.castString] = opts;
            opts = opts_;
        }
        options.defaults ||= {};
        options.nullishDefaults ||= {};
        for (k of Object.keys(options.defaults)) {
            opts[k] ||= options.defaults[k];
        }
        for (k of Object.keys(options.nullishDefaults)) {
            opts[k] ??= options.nullishDefaults[k];
        }
        return opts;
    },

    /* Parse string into an array of terms by splitting on spaces except where
     * multiple words are quoted
     */
    parseTerms: function(args) {
        const argstr = typeof args==="string" ? args : args.join(" ").trim();
        const words = argstr.split(" ");
        var terms = [];
        for (i=0; i<words.length; ++i) {
            /* FIXME? case of an isolated quote surrounded by spaces */
            /* TODO: proper parsing with escapes; decide how to treat mid-word quotes */
            if (words[i].startsWith("\"")) {
                const termwords = [words[i]];
                if (words[i] == "\"") i++;
                while (!words[i].endsWith("\"")) {
                    i++;
                    termwords.push(words[i]);
                }
                terms.push(termwords.join(" ").replace(/^"|"$/g, ""));
            } else
                terms.push(words[i]);
        }
        return terms;
    },

    pasten: async function(args, opts={}) {
        opts = this.parseOpts(opts, {castString: "where", nullishDefaults:{where:"last"}});
        const n = this.parseArgs(args, {type: "number"})||1;
        if (opts.where=="here") {
            utils.cbread(0).then(s=>utils.tab.open(s, "here"));
            for (i=1; i<n; ++i)
                utils.cbread(i).then(s=>utils.tab.open(s, {where: "related", background: true}));
        } else {
            for (i=0; i<n; ++i)
                utils.cbread(i).then(s=>utils.tab.open(s, opts));
        }
    },

    /* TODO: add description system and allow searching by description
     */
    searchConfig: function(key, term) {
        const conf = tri.config.get(key);
        return Object.keys(conf).map(k=>sprintf("%-8s\t%-s", k, conf[k])).filter(s=>s.match(term));
    },

    searchNmapsWrapper: async function (term) {
        const conf = this.searchConfig("nmaps", term.trim());
        return utils.messageBox(conf, {contPrefix: "\t\t"});
    },
};

// ───────────────────────────────────────────────────────────────────────────────

window.utils = utils;
