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

    decode: function(url, opts={}) {
        opts = utils.tri.parseOpts(opts, {castFunction: "decodeFn"});
        const decodeFn = opts.decodeFn || decodeURIComponent;
        const components = url.split("%s");
        return components.map(decodeFn).join("%s");
    },

    jsurirun: async function(url, opts={}) {
        if (opts.searchterm) url = url.trim().replace("%s", opts.searchterm);
        const js = utils.decode(url.replace(/^javascript:/, ""));
        return tri.controller.acceptExCmd(`js ${js}`);
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
        if (typeof lines === "string") lines = lines.split("\n");
        const w = parseInt(opts.width) || Infinity;
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

    msg: async function(lines, opts={}) {
        if (typeof lines === "string")
            lines = lines.split("\n");
        else if (typeof lines !== "object")
            lines = [lines];
        else if (lines instanceof Promise)
            lines = await lines;
        else if (!Array.isArray(lines)) lines = [
            String(lines), "",
            ...Object.getOwnPropertyNames(lines).map(l=>`${l}: \t  ${lines[l]}`)
        ];
        return this.messageBox(lines, opts);
    },

    openHistoryItems: async function(opts={}) {
        opts.where ||= "last";
        opts.multiSelect ??= true;
        const items = await this.searchHistory(opts);
        for await (const item of items) await utils.tab.open(item.url, opts);
        return items && items?.length;
    },

    openHistoryItemsWrapper: async function(args) {
        args = this.tri.parseArgs(args);
        const [where, bg, days] = args;
        return this.openHistoryItems({
            where: where,
            background:this.parseBool(bg),
            hoursAgo: 24*(days||4)
        });
    },

    openHistorySearchWrapper: async function(args) {
        args = this.tri.parseArgs(args);
        const [where, bg, days] = args;
        const text = await this.query("text to search:");
        return this.openHistoryItems({
            text: text,
            where: where,
            background:this.parseBool(bg),
            hoursAgo: 24*(days||4)
        });
    },

    parseBool(s) {
        if (["true", "yes", "on", "1"].includes(s)) return true;
        else if (["false", "no", "off", "0"].includes(s)) return false;
        else return null;
    },

    query: async function(msg="") {
        const res = await tri.native.run(`kdialog --inputbox '${msg}'`);
        return res.content.replace(/\n$/,"");
    },

    /**   Search history for TEXT and choose from results with rofi
     *  opts.text          text to search for
     *  opts.startTime:    earliest time for history results
     *  opts.endTime:      latest time for history results
     *  opts.hoursAgo:     alternative to startTime/endTime;
     *                     return results from last N hours, or
     *                     specify "N-M" for results from N hours to M hours ago
     *  opts.maxResults:   maximum results to send to rofi (default 100)
     *  opts.prompt:       rofi prompt
     *  opts.format:       rofi results format option
     *  opts.multiSelect:  run rofi in multi-select mode
     */
    searchHistory: async function(opts={}) {
        opts.text ||= "";
        /* prompt and results format */
        opts.prompt ??= "Select tabs (S-Enter): ";
        opts.format ||= "i";
        /* time range of results */
        if (!opts.hoursAgo && !opts.startTime && !opts.endTime)
            opts.daysAgo = 4;
        if (opts.daysAgo && !opts.hoursAgo)
            opts.hoursAgo = 24 * opts.daysAgo;
        if (opts.hoursAgo) {
            if (opts.startTime || opts.endTime) {
                this.message("ERROR: conflicting options");
                return null;
            }
            else if (typeof opts.hoursAgo === "number")
                opts.startTime = new Date() - 3600000 * opts.hoursAgo;
            else {
                const [startHoursAgo, endHoursAgo] = opts.hoursAgo.split("-").map(Number);
                opts.startTime = new Date() - 3600000 * startHoursAgo;
                opts.endTime   = new Date() - 3600000 * endHoursAgo;
            }
        }
        const startTime = opts.startTime && new Date(opts.startTime);
        const endTime = opts.endTime && new Date(opts.endTime);
        /* number of results */
        opts.maxResults ||= Number.MAX_SAFE_INTEGER;
        /* main */
        const items = await browser.history.search({
            text: opts.text,
            startTime: startTime,
            endTime: endTime,
            maxResults: opts.maxResults
        });
        const datestr = h=>new Date(h.lastVisitTime)
              .toLocaleString()
              .replace(/(\d\d\/\d\d)\/\d\d(\d\d), (\d\d?:\d\d):\d\d ([ap]m)/, "$1/$2, $3 $4");
        const formatter = h=>sprintf("%18s\t%-40s\t<%s>", datestr(h), S.ellipsize(h.title, 40), h.url);
        const dmenuInput = items.map(formatter).join("\n");
        const dmenuOpts = opts.multiSelect ? "-multi-select -i" : "-i";
        const rofithemestr='#window {width: 80%;} #listview {lines: 25;}';
        const cmd = `dmenuin="$(cat <<'EOF'\n${dmenuInput}\nEOF\n)"; echo "$dmenuin" | ` +
              `rofi -dmenu -theme-str "${rofithemestr}" -format ${opts.format} -p "${opts.prompt}" ${dmenuOpts}`;
        return tri.native.run(cmd).then(
            res => res.content ? res.content.trim().split("\n").map(i=>items[Number(i)]) : null
        );
    },

    select: async function(input, opts={}) {
        if (Array.isArray(input)) input = input.join("\n");
        opts = this.tri.parseOpts(opts, {defaults:{prompt:"", format:"s"}});
        const rofithemestr = '#window {width: 80%;} #listview {lines: 25;}';
        const rofithemeopt = `-theme-str '${rofithemestr}'`;
        const dmenuOpts = opts.multiSelect ? "-multi-select -i" : "-i";
        const prompt = [
            opts.prompt,
            opts.multiSelect ? "[Shift+ENTER:select, ENTER:return]" : "[ENTER:select]"
        ].join(" ");
        const inputcmd = opts.tempfile
              ? `cat ${opts.tempfile} | `
              : `dmenuin="$(cat <<'EOF'\n${input}\nEOF\n)"; echo "$dmenuin" | `;
        const cmd = `${inputcmd} rofi -dmenu ${rofithemeopt} -format ${opts.format} -p "${prompt}" ${dmenuOpts}`;
        const res = await tri.native.run(cmd);
        return res?.content.trim().split("\n");
    },

    xdoclick: async function(x, y, button=1, opts={}) {
        const xyres = await tri.native.run(
            `xdotool getmouselocation | perl -pe 's/x:(\\d+) y:(\\d+) .*/$1 $2/';`);
        const [x0, y0] = xyres.content.trim().split(" ");
        const excmd = `exclaim_quiet xdotool mousemove ${x} ${y} click ${button}`;
        if (opts.return) {
            return tri.controller.acceptExCmd(excmd).then(
                _=>tri.controller.acceptExCmd(`exclaim_quiet xdotool mousemove ${x0} ${y0}`)
            );
        } else
            return tri.controller.acceptExCmd(excmd);
    },

    xdoclickWrapper: async function(args, opts={}) {
        const [x, y, n] = args.join(" ").trim().split(" ");
        const button = n || 1;
        return this.xdoclick(x, y, button, opts);
    },


    /* adapted from tridactyl source for ;x in lib/config.ts */
    xdoelem: async function(selector, xdocmd, opts={}) {
        /* xdoelem(selector, xdocmd)
             Move mouse to first element matching selector, then execute further commands.
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
    xdoelemWrapper: async function(argstr, opts={}) {
        const [selector, xdocmd] = argstr.split(/ +-e +/).map(s=>s.trim());
        return this.xdoelem(selector, xdocmd, opts);
    },

    yank: function(s, opts={}) {
        /* options */
        opts = utils.tri.parseOpts(opts, {castBoolean: "msg"});
        opts.msg ??= true;
        /* yank */
        tri.excmds.yank(s);
        /* message? */
        if (opts.msg) {
            opts.prefix ??= "Copied" + (opts.useAlert ? "...\n" : ": ");
            this.message(s, opts);
        }
    },

    yankf: function(fstr, ...rest) {
        const opts = typeof rest.at(-1) == "object"
              ? rest.pop()
              : {};
        return this.yank(sprintf(fstr, ...rest), opts);
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
        const t = await this.get(tabnum, opts);
        return t.id;
    },

    getPinned: async function() {
        return browser.tabs.query({currentWindow: true, pinned: true});
    },

    highlight: async function(tabnum, hl=true) {
        /* tabnum:Int+, hl:true|false|"toggle" => Promise(Tab) */
        const tab = await this.get(tabnum);
        if (hl=="toggle") hl = !tab.highlighted;
        const isActive = tab.id == await tri.webext.activeTabId();
        return browser.tabs.update(tab.id, {highlighted: hl, active: isActive });
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

    moveToAlternate: async function(n=1) {
        const alt = await this.getAlternate(n);
        return this.move(alt.index+1);
    },

    /**   open(URL, { OPTIONS... })
     *    open(URL, WHERE)
     *  opts.where ["here" (default), "related", "next", "last"]: where to open new tab (if any)
     *  opts.background: don't switch to new tab
     */
    open: async function(url, opts={}) {
        opts = utils.tri.parseOpts(opts, {castString: "where"});
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

    openAndRun: async function(url, code, opts={}) {
        opts = utils.tri.parseOpts(
            opts, {
                castString: "where",
                defaults: {
                    where: "related",
                    runAt: "document_idle",
                },
            });
        const newtab = await this.open(url, opts);
        const execOpts = {
            matchAboutBlank: opts.matchAboutBlank,
            runAt: opts.runAt,
        };
        if (opts.file)
            execOpts.file = code;
        else {
            execOpts.code = (typeof code == "function")
                ? `(${code.toString()})()`
                : code;
        }
        if (opts.frame == "all")
            execOpts.allFrames = true;
        else
            execOpts.frameId = opts.frame || 0;
        // utils.msg(`browser.tabs.executeScript(${newtab.id}, ${execOpts}) -- code: ${execOpts.code}`);
        return browser.tabs.executeScript(newtab.id, execOpts);
    },

    openMultiple: async function(urls, opts={}) {
        urls = urls.map(u=>u.trim()).filter(u=>u);
        opts.where ||= "last";
        opts.background ??= (["related", "next"].includes(opts.where));
        for (const url of urls) await utils.tab.open(url, opts);
        return urls;
    },

    /**   openOrSummon(URL, { OPTIONS... })
     *  opts.where ["here", "related" (default), "next"]: where to open new tab (if any)
     *  opts.regex: regex to test if existing tab qualifies
     *  opts.reload: whether to reload existing tab
     *  opts.background: whether to leave new/summoned tab in background, or make active
     *  opts.closeCurrent [default: true if where=="here"]: whether to close current tab
     */
    openOrSummon: async function(url, opts={}) {
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

    /**   openOrSwitch(URL, { OPTIONS... })
     *    openOrSwitch(URL, WHERE)
     *  opts.where ["last" (default), "here", "related", "next"]: where to open new tab (if any)
     *  opts.regex: regex to test if existing tab qualifies
     *  opts.reload: whether to reload existing tab
     *  opts.closeCurrent [default: true if where=="here"]: whether to close current tab
     */
    openOrSwitch: async function (url, opts={}) {
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

    removeWithRofi: async function(opts={}) {
        const indexes = await this.rofiChoose(opts);
        const N = await this.getN();
        const nPinned = (await this.getPinned()).length;
        const rmindexes = opts.invert ?
              tri.R.difference(tri.R.range(nPinned, N), indexes)
              : indexes.slice(nPinned);
        const ns = rmindexes.map(i=>i+1);
        if (opts.review)
            tri.excmds.fillcmdline(`tabclose ${ns.join(" ")}`);
        else
            tri.controller.acceptExCmd(`tabclose ${ns.join(" ")}`);
    },

    /**  rofiChoose({ OPTIONS... })    Return the 0-based index of tab(s) chosen
     */
    rofiChoose: async function (opts={}) {
        opts.prompt ??= "Select tabs (S-Enter): ";
        opts.format ||= "i";
        const alltabs = await this.getAll();
        const formatter = (t,i)=>sprintf("%-3d  %-40s    <%s>", i+1, S.ellipsize(t.title, 40), t.url);
        const alltabsitems = alltabs.map(formatter);
        const dmenuInput = alltabsitems.join("\n");
        const cmd = `dmenuin="$(cat <<'EOF'\n${dmenuInput}\nEOF\n)"; echo "$dmenuin" | ` +
              `rofi -dmenu -width 80 -format ${opts.format} -p "${opts.prompt}" -multi-select -i`;
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
        const cmd = `dmenuin="$(cat <<'EOF'\n${dmenuInput}\nEOF\n)"; echo "$dmenuin" | ` +
              `rofi -dmenu -width 80 -regex -format f -p "${opts.prompt}" -i`;
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

    /** select(URL, { OPTIONS... })    select an existing tab containing URL
     *  select(URL, WHERE)
     *  opts.regex: regex to test if existing tab qualifies (if URL doesn't match)
     *  opts.reload: whether to reload existing tab
     *  opts.closeCurrent: whether to close current tab
     */
    select: async function (url="", opts={}) {
        if (url || opts.regex) {
            const currentTab = await tri.webext.activeTab();
            const alltabs = await this.getAll();
            const existingTab = alltabs.find(t=>t.url==url) || alltabs.find(t=>opts.regex?.test?.(t));
            return existingTab &&
                this.switch(existingTab.index+1).then(
                    async ()=>{
                        if (opts.closeCurrent) await browser.tabs.remove(currentTab.id);
                        if (opts.reload) await browser.tabs.reload(existingTab.id);
                        return existingTab;
                    });
        } else return null;
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

    /**   switch(N, { OPTIONS... })    Switch to tab N, optionally close original tab
        opts.removeCurrent: remove current tab
     */
    switch: async function(tabnum, opts={}) {
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
    bindMode: function(args) {
        const argstr = args.join(" ").trim();
        const bindmodeRe = /^([a-z]+) ([^ ]+) (.*)/;
        const match = argstr.match(bindmodeRe);
        [mode, key, rest] = match.slice(1);
        switch(mode) {
          case "all":
              tri.controller.acceptExCmd(`bind --mode=normal ${key} ${rest}`);
              tri.controller.acceptExCmd(`bind --mode=visual ${key} ${rest}`);
              tri.controller.acceptExCmd(`bind --mode=ex ${key} ${rest}`);
              tri.controller.acceptExCmd(`bind --mode=hint ${key} ${rest}`);
              /* fallthrough to case i */
          case "i":
              tri.controller.acceptExCmd(`bind --mode=insert ${key} ${rest}`);
              tri.controller.acceptExCmd(`bind --mode=input ${key} ${rest}`);
              break;
          default:
              tri.controller.acceptExCmd(`bind --mode=${mode} ${key} ${rest}`);
        }
    },

    /* cmdYankHistory :: number|string|array -> IO string
     */
    cmdYankHistory: function(args) {
        if (["number","string"].includes(typeof args)) args = [args];
        const ns = args.map(n=>Number(n)||1);
        const hist = tri.state.cmdHistory;
        const N = hist.length;
        const cmds = ns.map(n=>hist[N-n]);
        return utils.yank(cmds.join("\n"));
    },

    cmdYankHistoryLastN: function(n) {
        n = Number(n)||1;
        const cmds = tri.state.cmdHistory.slice(-n);
        return utils.yank(cmds.join("\n"));
    },

    docBindMode: function(args) {
        const argstr = args.join(" ").trim();
        const bindmodeRe = /^([a-z]+) ([^ ]+) "([^"]*)" (.*)/;
        const match = argstr.match(bindmodeRe);
        [mode, key, desc, rest] = match.slice(1);
        /* TODO: implement documentation system */
        /* for now, extract descriptions statically from file */
        switch(mode) {
          case "all":
              tri.controller.acceptExCmd(`bind --mode=normal ${key} ${rest}`);
              tri.controller.acceptExCmd(`bind --mode=visual ${key} ${rest}`);
              tri.controller.acceptExCmd(`bind --mode=ex ${key} ${rest}`);
              tri.controller.acceptExCmd(`bind --mode=hint ${key} ${rest}`);
              /* fallthrough to case i */
          case "i":
              tri.controller.acceptExCmd(`bind --mode=insert ${key} ${rest}`);
              tri.controller.acceptExCmd(`bind --mode=input ${key} ${rest}`);
              break;
          default:
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

    myfocusinput: function(arg) { const n = arg ? Number(arg)-1 : "-l"; tri.excmds.focusinput(n); },

    parseArgs: function(args, opts={}) {
        /* opts */
        opts = this.parseOpts(opts, {castString: "type"});
        var result = null, callerOpts = {};
        if (opts.allowOpts && typeof args.at(-1) == "object") {
            [args, [callerOpts]] = tri.R.splitAt(-1, args);
        }
        /* args */
        if (typeof args == "string") args = [args];
        const argstr = args.join(" ").trim();
        switch (opts.type) {
          case "string":
              result = argstr; break;
          case "number":
              result = Number(argstr) || null;
          case "array":
          default:
              result = argstr.split(/ +/); break;
        }
        if (opts.allowOpts)
            return [result, callerOpts];
        else
            return result;
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
    parseOpts: function(rawopts, options={}) {
        /* cast opts */
        var opts = {};
        if (options.castString && typeof rawopts == "string") {
            opts[options.castString] = rawopts;
        } else if (options.castFunction && typeof rawopts == "function") {
            opts[options.castFunction] = rawopts;
        } else if (options.castBoolean && typeof rawopts == "boolean") {
            opts[options.castBoolean] = rawopts;
        } else {
            opts = rawopts;
        }
        /* defaults */
        options.defaults ||= {};
        options.nullishDefaults ||= {};
        for (k of Object.keys(options.defaults)) {
            opts[k] ||= options.defaults[k];
        }
        for (k of Object.keys(options.nullishDefaults)) {
            opts[k] ??= options.nullishDefaults[k];
        }
        /* return */
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
        const n = Math.max(this.parseArgs(args, "number"), 1);
        if (opts.where=="here") {
            await utils.cbread(0).then(s=>utils.tab.open(s, "here"));
            for (i=1; i<n; ++i)
                await utils.cbread(i).then(s=>utils.tab.open(s, {where: "related", background: true}));
        } else {
            for (i=0; i<n; ++i)
                await utils.cbread(i).then(s=>utils.tab.open(s, opts));
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

    unbindMode: function(args) {
        const argstr = args.join(" ").trim();
        const bindmodeRe = /^([a-z]+) ([^ ]+)/;
        const match = argstr.match(bindmodeRe);
        [mode, key] = match.slice(1);
        switch(mode) {
          case "all":
              tri.controller.acceptExCmd(`unbind --mode=normal ${key}`);
              tri.controller.acceptExCmd(`unbind --mode=visual ${key}`);
              tri.controller.acceptExCmd(`unbind --mode=ex ${key}`);
              tri.controller.acceptExCmd(`unbind --mode=hint ${key}`);
              /* fallthrough to case i */
          case "i":
              tri.controller.acceptExCmd(`unbind --mode=insert ${key}`);
              tri.controller.acceptExCmd(`unbind --mode=input ${key}`);
              break;
          default:
              tri.controller.acceptExCmd(`unbind --mode=${mode} ${key}`);
        }
    },
};

// ───────────────────────────────────────────────────────────────────────────────

window.utils = utils;
