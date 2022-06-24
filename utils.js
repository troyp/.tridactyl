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

    /*    jsurirun(url, opts): execute javascript URI in page
     *  opts.searchterm [string]: search term for javscript bookmarklet (to replace %s)
     *  opts.searchterm [true: boolean]: prompt for search term if necessary
     *  opts.useOpen: run JS URI with :open command rather than :js
     */
    jsurirun: async function(url, opts={}) {
        if (opts.searchterm === true && url.includes("%s"))
            opts.searchterm = this.prompt("search term");
        if (opts.searchterm) url = url.trim().replace("%s", opts.searchterm);
        const js = utils.decode(url.replace(/^javascript:/, ""));
        const cmd = opts.useOpen
              ? `open ${url}`
              : `js ${utils.decode(url.replace(/^javascript:/, ""))}`;
        return tri.controller.acceptExCmd(cmd);
    },

    message: function(s, opts={}) {
        const s_ = (opts.prefix || "") + s;
        if (opts.temp) {
            const t = opts.duration || 3000;
            fillcmdline_tmp(s_, t);
        } else if (opts.cmdline) {
            fillcmdline_nofocus(s_);
        } else {
            this.messageBox(s_.split("\n"), opts);
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
        if (lines instanceof Promise)
            lines = await lines;
        if (typeof lines === "string")
            lines = lines.split("\n");
        else if (typeof lines !== "object")
            lines = [lines];
        else if (!Array.isArray(lines)) lines = [
            String(lines), "",
            ...Object.getOwnPropertyNames(lines).map(l=>`${l}: \t  ${lines[l]}`)
        ];
        return this.messageBox(lines, opts);
    },

    parseBool(s) {
        if (["true", "yes", "on", "1"].includes(s)) return true;
        else if (["false", "no", "off", "0"].includes(s)) return false;
        else return null;
    },

    prompt: async function(msg="enter text", opts={}) {
        if (opts.native) {
            const code = opts.default
                  ? `kdialog --textinputbox '${msg}' '${opts.default}'`
                  : `kdialog --inputbox '${msg}'`;
            const res = await tri.native.run(code);
            return res.content.replace(/\n$/,"");
        } else {
            const code = opts.default
                  ? `prompt("${msg}", "${opts.default}")`
                  : `prompt("${msg}")`;
            const res = await browser.tabs.executeScript({code: code});
            return res[0];
        }
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

    yank: function(s, opts={}) {
        /* options */
        opts = utils.tri.parseOpts(opts, {castBoolean: "cmdline"});
        opts.msg ??= true;
        opts.cmdline ??= true;
        /* yank */
        yank(s);
        /* message? */
        if (opts.msg) {
            opts.prefix ??= "Copied" + (opts.cmdline ? ": " : "...\n");
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
    aboutURIWhitelist: ["about:license", "about:logo", "about:rights", "about:blank"],

    currentOrd: async function() {
        const currentTab = await tri.webext.activeTab();
        return currentTab.index + 1;
    },

    filter: function(pred) {
        return this.remove((...args)=>!pred(...args));
    },

    filterWr: async function(args) {
        const expr = utils.tri.parseExpr(args);
        const pred = eval(`(t, i, i0)=>${expr}`);
        return this.filter(pred);
    },

    firstDWIM: async function() {
        const currentTab = await tri.webext.activeTab();
        if (await this.currentOrd() == 1) {
            const pinned = await this.getPinned();
            this.switch(pinned.length + 1);
        } else
            this.switch(1);
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

    getLastOpened: async function(url, opts={}) {
        const sorted = await this.sortedByAccess();
        const f = opts.matchURLorTitle
              ? t => t.url == url || t.title == url.replace(/^file:\/\//, "")
              : t => t.url == url;
        const filtered = sorted.filter(f);
        return filtered?.[0];
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
        opts = utils.tri.parseOpts(opts, {castString: "where", castNumber: "where"});
        if (opts.where === "tabopen") opts.where = tri.config.tabopenpos;
        if (opts.where === "middleclick") opts.where = tri.config.relatedopenpos;
        var addr_type;
        [url, addr_type] = await utils.tri.parseUrl(url, opts.where!=="here");
        const isURL = addr_type === "URL";
        const isIllegal = /^file:|^about:/.test(url) && !this.aboutURIWhitelist.includes(url);
        const thisTab = await tri.webext.activeTab();
        if (isURL && isIllegal) {
            /* illegal file:|about: URL */
            return this.openIllegal(url, opts);
        } else if (opts.where === "here") {
            /* dispatch to :open */
            return open(...url.split(" "));
        } else if (opts.where === tri.config.tabopenpos) {
            /* dispatch to :tabopen */
            const args = opts.background ? ["-b", ...url.split(" ")] : url.split(" ");
            return tabopen(...args);
        } else {
            /* force resolution of address into URL */
            /* then call tabCreateWrapper */
            if (!isURL) url = await utils.tri.parseUrl(url, true)[0];
            const i = thisTab.index;
            const N = await this.getN();
            const tabCreateOpts = {
                url: url,
                active: !opts.background,
            };
            switch (opts.where) {
              case "last":
                  tabCreateOpts.index = N;
                  break;
              case "related":
                  tabCreateOpts.index = i+1;
                  break;
              case "next":
                  tabCreateOpts.index = i+1;
                  tabCreateOpts.openerTabId = thisTab.id;
                  break;
              default:
                  /* opts.where can take a tabnumber */
                  tabCreateOpts.index = opts.where-1;
                  break;
            }
            return this.tabCreateWrapper(tabCreateOpts);
        }
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

    openIllegal: async function(url, opts={}) {
        opts = utils.tri.parseOpts(opts, {castString: "where", castNumber: "where"});
        const startTab = await tri.webext.activeTab();
        if (opts.where === "here") {
            if (opts.useOmnibox) {
                await tri.native.run(
                    `xdotool key ctrl+l key ctrl+u sleep 0.5 type ${url}; xdotool key Return`
                );
                return startTab;
            } else {
                opts.where = "next";
                return this.openIllegal(url, opts);
            }
        } else { /* new tab */
            const t = await tabopen(...url.split(" "));
            const i = startTab.index;
            var pos;
            switch (opts.where) {
              case "last":
                  pos = -1;
                  break;
              case "related":
                  pos = i+1;
                  break;
              case "next":
                  pos = i+1;
                  break;
              default:
                  /* opts.where can take a tabnumber */
                  /* FIXME: position and background both break when opts.where is a number */
                  pos = opts.where-1;
                  break;
            }
            await browser.tabs.move(t.id, {index: pos});
            if (opts.background) await this.switch(startTab);
            return t;
        }
    },

    openMultiple: async function(urls, opts={}) {
        opts = utils.tri.parseOpts(opts, {castString: "where", castNumber: "where"});
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
        const testfn = opts.regex
              ? (t=> t.url.match(opts.regex))
              : opts.exactMatch ? (t=> t.url == url) : (t=> t.url.indexOf(url)>=0);
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

    openorsummonWr: async function(argscount, where, whereAlt, opts={}) {
        const [args, count] = utils.tri.parseArgsAndCount(argscount);
        return this.openOrSwitch(args[0], {where: (count ? whereAlt : where), ...opts});
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
        const testfn = opts.regex
              ? (t=> t.url.match(opts.regex))
              : opts.exactMatch ? (t=> t.url == url) : (t=> t.url.indexOf(url)>=0);
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

    openorswitchWr: async function(argscount, where, whereAlt, opts={}) {
        const [args, count] = utils.tri.parseArgsAndCount(argscount);
        return this.openOrSwitch(args[0], {where: (count ? whereAlt : where), ...opts});
    },

    ordstrToIndex: async function(n) {
        const N = await this.getN();
        switch (n) {
          case "^": return 0;
          case "$": return N - 1;
          case ".": return (await this.currentOrd()) - 1;
          default:
              n = parseInt(n);
              return (N+n-1) % N;
        }
    },

    ordstrToOrd: async function(n) {
        const idx = await this.ordstrToIndex(n);
        return idx + 1;
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
        const ids = tabs.filter(t=>{
            t.titleurl = `${t.url}\n${t.title}`;
            const i = t.index + 1;
            const i0 = atab.index + 1;  /* index may change: keep inside loop */
            return pred(t, i, i0);
        }).map(tab => tab.id);
        return browser.tabs.remove(ids);
    },

    removeWr: async function(args) {
        const expr = utils.tri.parseExpr(args);
        const pred = eval(`(t, i, i0)=>${expr}`);
        return this.remove(pred);
    },

    removeRange: async function(start, end, opts={}) { return this.remove((_,i) => i>=start && i<=end, opts); },

    removeRangeWr: async function(args, opts={}) {
        const [start, end] = utils.tri.parseArgs(args);
        const t1 = await utils.tab.ordstrToOrd(start);
        const t2 = await utils.tab.ordstrToOrd(end);
        return this.removeRange(t1, t2, opts);
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
            fillcmdline(`tabclose ${ns.join(" ")}`);
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

    rofiHighlight: async function(opts={}) {
        const currentTab = await tri.webext.activeTab();
        const alltabs = await this.getAll();
        const idxs = await this.rofiChoose();
        const selected = alltabs.filter(t=>idxs.includes(t.index));
        if (selected==[]) return [];
        else if (!selected.includes(currentTab)) {
            const nextTab = selected[0];
            await browser.tabs.update(nextTab.id, {highlighted: true, active: false});
            await browser.tabs.update(currentTab.id, {highlighted: false });
        }
        selected.forEach(async tab => await browser.tabs.update(tab.id, {highlighted: true }));
        return selected;
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

    showN: async function(opts={}) {
        opts = utils.tri.parseOpts(opts, {castBoolean: "breakdown"});
        const n = await this.getN();
        if (opts.breakdown) {
            const pinned = await this.getPinned();
            const p = pinned.length;
            return fillcmdline_nofocus(`#TABS (pinned/unpinned):  ${n} (${p}/${n-p})`);
        } else return fillcmdline_nofocus(`#TABS:  ${n}`);
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
          opts = utils.tri.parseOpts(opts, {castBoolean: "removeCurrent"});
          const thisTab = await tri.webext.activeTab();
          var otherTab;
          if (tabnum == null && opts.id) {
              otherTab = await browser.tabs.get(opts.id);
          } else {
              if (tabnum=="$") tabnum = 0; else tabnum &&= Number(tabnum);
              const N = await this.getN();
              const n = (tabnum-1).mod(N) + 1;
              otherTab = (await browser.tabs.query({currentWindow: true, index: n-1}))[0];
          }
          if (opts.removeCurrent) browser.tabs.remove(thisTab.id);
          return browser.tabs.update(otherTab.id, { active: true });
    },

    switchAlternate: async function(n=1, opts={}) {
        const thisTab = await tri.webext.activeTab();
        const alt = await this.getAlternate(n);
        if (opts.removeCurrent) browser.tabs.remove(thisTab.id);
        return browser.tabs.update(alt.id, {active: true});
    },

    //  FIXME:
    switchWr: async function(args) {
        if (args && args.length > 1) {
            const n = utils.tri.parseArgs(args, "number");
            const res = await this.switch(n);
            tri.config.USERCONFIG.tabswitch_last = await utils.tab.getid(n);
            return res;
        } else {
            return this.switch(null, { id: tri.config.USERCONFIG.tabswitch_last });
        }
    },

    /* taken from tridactyl src/lib/webext.ts -- author: Oliver Blanthorn */
 	  tabCreateWrapper: async function (options) {
        const tab = await browserBg.tabs.create(options);
        const answer = new Promise(resolve => {
            /* can't run in content scripts */
            if (options.waitForDOM)
                browserBg.runtime.onMessage.addListener((message, sender) => {
                    if (message !== "dom_loaded_background" || sender?.tab?.id !== tab.id) return;
                    browserBg.runtime.onMessage.removeListener(listener);
                    resolve(tab);
                });
            else resolve(tab);
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
        const argstr = this.parseArgs(args, "string");
        const bindurlRe = /^([^ ]+) ([^ ]+) "([^"]*)" (.*)/;
        const [site, key, desc, rest] = argstr.match(bindurlRe).slice(1);
        tri.controller.acceptExCmd(`bindurl ${site} ${key} ${rest}`);
    },

    docdef: function(args, opts={}) {
        const argstr = args.join(" ").trim();
        const docdefRe = /^([a-zA-Z_!:]+) ([^ ]+) "([^"]*)" (.*)/;
        const docsetRe = /^([a-zA-Z_!:]+) ([^ ]+) "([^"]*)"/;
        const re = opts.noDef ? docsetRe : docdefRe;
        const match = argstr.match(re);
        [defCmd, key, desc, rest] = match.slice(1);
        /* store descriptions under tri._doc, eg.
           tri._doc.command.urlup_n == "Go to the nth parent URL" */
        /* TODO: do bindings have a unique representation for keys?
           if not, convert to canonical representation */
        ((window.tri._doc ||= {})[defCmd] ||= {})[key] = desc;
        if (!opts.noDef)
            tri.controller.acceptExCmd(`${defCmd} ${key} ${rest}`);
    },

    gotoCommandSource: function(s) {
        const repo = "~/source/git-repos/tridactyl";
        const cmd = `grep -inP 'export (async )?function ${s}[(]' ${repo}/src/excmds.ts`;
        tri.native.run(cmd).then(
            l=> {
                const n = parseInt(l.content);
                const url = `https://github.com/tridactyl/tridactyl/blob/master/src/excmds.ts#L${n}`;
                return tabopen(url);
            }
        );
    },

    myfocusinput: function(arg) { const n = arg ? Number(arg)-1 : "-l"; focusinput(n); },

    /*    parseArgs(args, opts): return args as a string, an array of nonempty strings, or a number
     *  opts.type: desired result type
     *  opts.allowOpts: if true, treat the final arg as an opts object if possible; return [args, opts]
     */
    parseArgs: function(args, opts={}) {
        if (!Array.isArray(args)) args = [args];
        /* opts */
        opts = this.parseOpts(opts, {castString: "type"});
        var result = null, callerOpts = {};
        const finalArg = args.at(-1);
        if (opts.allowOpts && typeof finalArg == "object" && !Array.isArray(finalArg)) {
            [args, [callerOpts]] = tri.R.splitAt(-1, args);
        }
        /* args */
        const argstr = args.join(" ").trim();
        switch (opts.type) {
          case "string":
              result = argstr; break;
          case "number":
              result = Number(argstr) || null; break;
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

    /** convert args to a string for interpretation by eval() */
    parseExpr: function(args, opts={}) {
        const argstr = this.parseArgs(args, {type: "string", ...opts});
        return argstr.replace(/ OR |‖/g, " || ").replace(/⊕/g, "|");
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
        } else if (options.castNumber && typeof rawopts == "number") {
            opts[options.castNumber] = rawopts;
        } else if (options.castHTMLElement && rawopts instanceof HTMLElement) {
            opts[options.castHTMLElement] = rawopts;
        } else if (options.castRegExp && rawopts instanceof RegExp) {
            opts[options.castRegExp] = rawopts;
        } else if (options.castArray && Array.isArray(rawopts)) {
            opts[options.castArray] = rawopts;
        } else if (options.castArrayToBooleanOpts && Array.isArray(rawopts)) {
            opts = rawopts.reduce((acc,e)=>(acc[e]=true) && acc, {});
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
        const argstr = typeof args==="string" ? args : args.join(" ").trim().replace(/ +/, " ");
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

    parseUrl: async function(url, opts={}) {
        if (Array.isArray(url)) url = url.join(" ").trim();
        opts = this.parseOpts(opts, {castBoolean: "force"});
        try {
            return [(new URL(url)).href, "URL"];
        } catch (_) {
            if (url.match(/^[^: ]+\.[^: ]+(\/|$)/)) {
                return [`https://${url}`, "URL"];
            } else {
                const se = url.split(" ")[0];
                const surls = tri.config.get("searchurls");
                const kwurl = await places.kw.get(url);
                if (surls.hasOwnProperty(se)) {
                    const surl = surls[se];
                    return opts.force
                        ? [this.searchurlResolve(url), "URL"]
                        : [url, "searchurl"];
                } else if (kwurl) {
                    return [kwurl, "URL"];
                } else {
                    return opts.force
                        ? [this.searchurlResolve(url, {default: true}), "URL"]
                        : [url, "query"];
                }
            }
        }
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

    searchNmapsWrapper: async function (r, opts={}) {
        regexp = new RegExp(r.trim(), opts.caseSensitive ? "" : "i");
        const conf = this.searchConfig("nmaps", regexp);
        return utils.messageBox(conf, {contPrefix: "\t\t"});
    },

    searchurlResolve: function(url, opts={}) {
        opts = this.parseOpts(opts, {castBoolean: "default"});
        url = url.trim();
        const defaultSE = tri.config.get("searchengine") || "google";
        const [SE, search] = opts.default
              ? [defaultSE, url]
              : S.splitFirst(url, / +/);
        const su = tri.config.get("searchurls")[SE];
        return su.includes("%s")
            ? su.replace(/%s/g, search)
            : su + search;
    },

    qmarks: async function() {
        const qmarks = Object.entries(tri.config.USERCONFIG.qmarks);
        const lines = qmarks.map(([k, u]) => {
            const urlLines = tri.R.splitEvery(58, u);
            const keyLines = [`${k}:  `, ...urlLines.slice(1).map(_ => "    ")];
            return tri.R.zipWith((kl,ul)=>kl+ul, keyLines, urlLines).join("\n");
        });
        utils.msg(lines);
    },

    qmarkset: async function(c) {
        tri.config.USERCONFIG.qmarks ||= {};
        tri.config.USERCONFIG.qmarks[c] = await js("window.location.href");
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
