// ╭────────────────────────────────────────────╮
// │ apps.js -- Application code for .tridactyl │
// ╰────────────────────────────────────────────╯

var apps = {
    bmget: async function(args=[], opts={}) {
        args = utils.tri.parseArgs(args);
        opts = utils.tri.parseOpts(
            opts,
            { castString: "switches",
              nullishDefaults: {switches: "-u -s"}
            }
        );
        const cmd  = `kwsearch ${[opts.switches, ...args].join(" ").trim()}`;
        return tri.native.run(cmd).then(
            res => opts.decode ? utils.decode(res.content, opts.decodeFn) : res.content
        );
    },

    bmklet: async function(args=[], opts={}) {
        const switches = opts.kw
              ? `-u -J -K ${opts.kw}`
              : `-u -J -s`;
        const bmk = await this.bmget(args, {switches: switches, decode: true});
        utils.jsurirun(bmk);
    },

    /* Choose bookmarklet with rofi, then query for parameters */
    bmkletq: async function(args=[], opts={}) {
        const bmk = await this.bmget(args, {switches: "-u -J -s", decode: true});
        const query = await utils.query("parameters:");
        utils.jsurirun(bmk, {searchterm: query});
    },

    bmrofi: async function(args) {
        const [where, bg, ...switches] = utils.tri.parseArgs(args);
        const switchstr = switches?.length ? switches.join(" ") : "-s -u";
        const cmd = `kwsearch ${switchstr}`;
        return tri.native.run(cmd).then(
            res => utils.tab.open(res.content, {where: where||"last", background: bg==="t"})
        );
    },

    bmyank: async function(args=[], opts={}) {
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

    convertUnits: function(args) {
        args = args.filter(a=> a.trim()!== "");
        var n=1, unit1="", unit2="";
        if (args.length==1) {
            return tri.native.run(`units -t ${args[0]}`).then(
                res => res.content
            );
        } else {
            if (args.length==2) {
                var match = String(args[0]).match(/([0-9.*/+-]*)(.*)/);
                n = match[1]||"1";
                if (match[2]) {
                    unit1 = match[2];
                    unit2 = args[1];
                } else {
                    unit1 = args[1];
                }
            } else {
                [n, unit1, unit2] = args;
            }
            return tri.native.run(`units -t "${eval(n)} ${unit1}" ${unit2}`).then(
                res => {
                    if (res.code==0) return n + unit1 + " = " + res.content + unit2;
                    else return `ERROR code ${res.code}:${res.content}\n\tcommand: ${res.command}`;
                }
            );
        }
    },

    /** A version of exclaim that uses fillcmdline_nofocus
     */
    exclaim_: async function(args) {
        const res = await tri.native.run(args.join(" "));
        tri.excmds.fillcmdline_nofocus(res.content.replace(/\n/g, "   "));
        return res.content;
    },

    kwsearch: async function(args, opts={where: "last"}) {
        const [kw, ...rest] = utils.tri.parseArgs(args);
        return tri.native.run(`kwsearch -K ${kw} ${rest.join(" ")||"''"}`).then(
            res => utils.tab.open(res.content, opts));
    },

    kwrofi: async function(args, opts={where: "last"}) {
        const switches = opts?.switches || "-u -k -s";
        const where = opts.where || "last";
        const cmd = `kwsearch ${switches} ${args.join?.(" ")?.trim()}`;
        return tri.native.run(cmd).then(
            res => utils.tab.open(res.content, opts)
        );
    },

    multipleEngineSearch: async function(rawargs, opts={}) {
        opts.where ||= "last";
        opts.background ??= true;
        const args = utils.tri.parseTerms(rawargs);
        const query = args.slice(-1)[0];
        const searchEngines = args.slice(0, -1);
        if (searchEngines.length==0) {
            utils.tab.open(query, opts);
        } else {
            if (opts.where!=="related") searchEngines.reverse();
            searchEngines.forEach(s => apps.kwsearch([s, query], opts));
        }
    },

    /* TODO: should I enforce the order of tabs? Or at least statistically
     * encourage correct order by introducing a short delay?
     */
    multipleQuerySearch: async function(rawargs, opts={}) {
        opts.where ||= "last";
        opts.background ??= true;
        const [searchEngine, ...queries] = utils.tri.parseTerms(rawargs);
        if (opts.where!=="related") queries.reverse();
        queries.forEach(q => apps.kwsearch([searchEngine, q], opts));
    },

    sunriseSunset: function(lat, long) {
        const times = SunCalc.getTimes(new Date(), lat, long);
        return [sunrise, sunset] = [times.sunrise, times.sunset].map(t=>t.toTimeString());
    },

}

apps.trans = {
    page: {
        google: function(url, from="auto", to="en", opts={}) {
            url ||= tri.contentLocation;
            return utils.tab.open(`http://translate.google.com/translate?hl=&sl=${from}&tl=${to}&u=${url}`, opts);
        },
        bing: function(url, from="auto", to="en", opts={}) {
            url ||= tri.contentLocation;
            return utils.tab.open(
                `http://www.microsofttranslator.com/bv.aspx?from=${from}&to=${to}&a=${url}`,
                opts
            );
        },
    },

    transsh: async function(args) {
        args = utils.tri.parseArgs(args, "string");
        const cmd = `! trans -no-ansi -show-original=n ${args} |` +
              `perl -pe 's/\\n+/ \| /g' |` +
              `perl -pe 's/\\s+/ /g' |` +
              `perl -pe 's/( \\|)+/\|/g'`;
        utils.yank(cmd, {msg:false});
        tri.controller.acceptExCmd(cmd);
    },

}

window.apps = apps;
