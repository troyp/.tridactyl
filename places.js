// ╭─────────────╮
// │             │
// │  places.js  │
// │             │
// ╰─────────────╯

const places = {};

// ───────────────────────────────────────────────────────────────────────────────
// ╭────────────────────────╮
// │ places.bm -- bookmarks │
// ╰────────────────────────╯

places.bm = {
    /* Choose bookmarklet with keyword or rofi, then query for parameters if %s in URI */
    bmklet: async function(args=[], opts={}) {
        const switches = opts.kw
              ? `-u -J -K '${opts.kw} --'`
              : `-u -J -s --`;
        const bmk = await this.get(args, {switches: switches, decode: true});
        const query = bmk.includes("%s")
              ? await utils.prompt("parameters:")
              : "";
        utils.jsurirun(bmk, {searchterm: query});
    },

    get: async function(args=[], opts={}) {
        args = utils.tri.parseArgs(args);
        opts = utils.tri.parseOpts(
            opts,
            { castString: "switches",
              nullishDefaults: {switches: "-u -s"}
            }
        );
        const cmd  = `kwsearch ${opts.switches} -- ${args.join(" ").trim()}`;
        return tri.native.run(cmd).then(
            res => opts.decode ? utils.decode(res.content, opts.decodeFn) : res.content
        );
    },

    rofi: async function(args) {
        const [where, bg, ...switches] = utils.tri.parseArgs(args);
        const switchstr = switches?.length ? switches.join(" ") : "-s -u";
        const cmd = `kwsearch ${switchstr}`;
        return tri.native.run(cmd).then(
            res => utils.tab.open(res.content, {where: where||"last", background: bg==="t"})
        );
    },

    yank: async function(args=[], opts={}) {
        args = utils.tri.parseArgs(args, "string");
        opts = utils.tri.parseOpts(
            opts,
            {
                castString: "switches",
                nullishDefaults: { switches: "-u -s", decode: true }
            }
        );
        if (!args && !opts.switches) opts.switches = "-u -s";
        const cmd  = `kwsearch ${opts.switches} ${args}`;
        return tri.native.run(cmd).then(
            res => utils.yank(opts.decode ? utils.decode(res.content, opts.decodeFn) : res.content)
        );
    },
};

// ╭──────────────────────────────────────╮
// │ places.kw -- keyword bookmark search │
// ╰──────────────────────────────────────╯

places.kw = {
    open: async function(args, opts={where: "last"}) {
        const [kw, ...rest] = utils.tri.parseArgs(args);
        return tri.native.run(`kwsearch -K '${kw}' -- '${rest.join(" ")}'`).then(
            res => utils.tab.open(res.content, opts));
    },

    get: async function(args) {
        const [kw, ...rest] = utils.tri.parseArgs(args);
        const res = await tri.native.run(`kwsearch -K '${kw}' -- '${rest.join(" ")}'`);
        return res.content.trim();
    },

    rofi: async function(args, opts={where: "last"}) {
        const switches = opts?.switches || "-u -k -s";
        const where = opts.where || "last";
        const cmd = `kwsearch ${switches} -- '${args.join?.(" ")?.trim()}'`;
        return tri.native.run(cmd).then(
            res => utils.tab.open(res.content, opts)
        );
    },

    multiengine: async function(rawargs, opts={}) {
        opts.where ||= "last";
        opts.background ??= true;
        const args = utils.tri.parseTerms(rawargs);
        const query = args.slice(-1)[0];
        const searchEngines = args.slice(0, -1);
        if (searchEngines.length==0) {
            utils.tab.open(query, opts);
        } else {
            if (opts.where!=="related") searchEngines.reverse();
            searchEngines.forEach(s => this.open([s, query], opts));
        }
    },

    /* TODO: should I enforce the order of tabs? Or at least statistically
     * encourage correct order by introducing a short delay?
     */
    multi: async function(rawargs, opts={}) {
        opts.where ||= "last";
        opts.background ??= true;
        const [enginestr, ...queries] = utils.tri.parseTerms(rawargs);
        const SEs = enginestr.split(/ +/);
        if (opts.where=="next") {
            queries.reverse();
            SEs.reverse();
        }
        const searches = SEs.flatMap(se=>queries.map(q=>[se,q]));
        for (s of searches) await this.open(s, opts);
    },

};

// ───────────────────────────────────────────────────────────────────────────────
// ╭────────────────────────╮
// │ places.dl -- downloads │
// ╰────────────────────────╯

places.dl = {
    /* nth latest download directory */
    getDir: async function(n=1) {
        return this.getLatest(n).then(d=>d.filename.replace(/[^/]*$/, ""));
    },

    /* nth latest download */
    getLatest: async function(n=1) {
        n = Number(n);
        const dls = await browser.downloads.search({limit: n, orderBy: ["-startTime"]});
        return dls[n-1];
    },

    /* open nth latest download directory in emacs dired */
    openDirInDired: async function(n=1) {
        const dir = await this.getDir(n);
        const cmd = `emacsclient -c -F '((name . "dactyl-dired"))' -e '(dired "${dir}")'`
              + `&& wmctrl -r "dactyl-dired" -b remove,maximized_vert,maximized_horz`
              + `&& wmctrl -r "dactyl-dired" -e 0,18,370,830,650`;
        return tri.native.run(cmd);
    },

    show: async function(opts={}) {
        const dls = await browser.downloads.search({limit: 0, orderBy: ["-startTime"]});
        return utils.msg(dls.map(dl => dl.filename));
    },

};

// ───────────────────────────────────────────────────────────────────────────────
// ╭────────────────────────╮
// │ places.hist -- history │
// ╰────────────────────────╯

places.hist = {
    /**   Search history for TEXT and choose from results with rofi
     *  opts.text          text to search for
     *  opts.queryText     query user for text to search for
     *  opts.startTime:    earliest time for history results
     *  opts.endTime:      latest time for history results
     *  opts.hoursAgo:     alternative to startTime/endTime;
     *                     return results from last N hours, or
     *                     specify "N-M" for results from N hours to M hours ago
     *  opts.daysAgo:      alternative to startTime/endTime/hoursAgo
     *  opts.maxResults:   maximum results to send to rofi (default 100)
     *  opts.prompt:       rofi prompt
     *  opts.format:       rofi results format option
     *  opts.multi:        run rofi in multi-select mode
     */
    get: async function(opts={}) {
        opts = utils.tri.parseOpts(opts, {
            defaults: {
                text: "",
                format: "i",
                maxResults: Number.MAX_SAFE_INTEGER,
                multi: true,
            },
            nullishDefaults: {
                prompt: "Select tabs (S-Enter): ",
            },
        });
        /* time range of results */
        if (!opts.hoursAgo && !opts.startTime && !opts.endTime)
            opts.daysAgo = 4;
        if (opts.daysAgo && !opts.hoursAgo)
            opts.hoursAgo = 24 * opts.daysAgo;
        if (opts.hoursAgo) {
            if (opts.startTime || opts.endTime) {
                utils.message("ERROR: conflicting options");
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
        /* query */
        if (opts.queryText)
            opts.text ||= await utils.prompt("text to search:");
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
        const dmenuOpts = opts.multi ? "-multi-select -i" : "-i";
        const rofithemestr='#window {width: 80%;} #listview {lines: 25;}';
        const cmd = `dmenuin="$(cat <<'EOF'\n${dmenuInput}\nEOF\n)"; echo "$dmenuin" | ` +
            `rofi -dmenu -theme-str "${rofithemestr}" -format ${opts.format} -p "${opts.prompt}" ${dmenuOpts}`;
        return tri.native.run(cmd).then(
            res => res.content ? res.content.trim().split("\n").map(i=>items[Number(i)]) : null
        );
    },

    open: async function(opts={}) {
        opts.where ||= "last";
        const items = await this.get(opts);
        items.forEach(async item => await utils.tab.open(item.url, opts));
        return items?.length;
    },

    openWr: async function(args, opts={}) {
        args = utils.tri.parseArgs(args);
        const [where, bg, days] = args;
        opts.background ??= utils.parseBool(bg);
        if (!opts.daysAgo && !opts.hoursAgo && !opts.startTime)
            opts.daysAgo = opts.queryText||opts.text ? 14 : 4;
        return this.open(opts);
    },

};

window.places = places;
