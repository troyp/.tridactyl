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
              ? `-u -J -K '${opts.kw}'`
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
        fillcmdline_nofocus(res.content.replace(/\n/g, "   "));
        return res.content;
    },

    kwsearch: async function(args, opts={where: "last"}) {
        const [kw, ...rest] = utils.tri.parseArgs(args);
        return tri.native.run(`kwsearch -K '${kw}' '${rest.join(" ")}'`).then(
            res => utils.tab.open(res.content, opts));
    },

    kwsearch_get: async function(args) {
        const [kw, ...rest] = utils.tri.parseArgs(args);
        const res = await tri.native.run(`kwsearch -K '${kw}' '${rest.join(" ")}'`);
        return res.content.trim();
    },

    kwrofi: async function(args, opts={where: "last"}) {
        const switches = opts?.switches || "-u -k -s";
        const where = opts.where || "last";
        const cmd = `kwsearch ${switches} '${args.join?.(" ")?.trim()}'`;
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

};

apps.pw = {
    /**   hash(S, { OPTIONS... }) Hash the string S, copy resulting password
     *  opts.punctuation: require punctuation
     *  opts.digitsOnly: use only digits in password
     *  opts.type: custom (8-char by default), short or long password
     *  returnTabNumber: return to specified tab after generating password
     *  keepOpen: keep password-hasher open when returning to other tag
     */
    hash: async function(s="", opts={}) {
        const masterpw = user.masterpw;
        const setup = `
            const delay = t => new Promise((resolve, _) => setTimeout(resolve, t));
            const $1t = (sel, text) => [...document.querySelectorAll(sel)].filter(e=>e.innerText.match(text))?.[0];
            const masterkey = document.getElementById("master-key");
            const sitetag = document.getElementById("site-tag");
            const more = document.getElementsByTagName("summary")[0];
            const noSpecial = document.getElementById("noSpecial");
            const punctuation = document.getElementById("punctuation");
            const digitsOnly = document.getElementById("digitsOnly");
            const shortbutton = $1t("button", "Short");
            const longbutton = $1t("button", "Long");
            const custombutton = $1t("button", "Generate Custom");
            sitetag.value = "${s}";
            masterkey.value = "${masterpw}";
            more.click();
            noSpecial.checked = true;
            punctuation.checked = ${opts.punctuation};
            digitsOnly.checked = ${opts.digitsOnly};
        `;
        const generate = `
            delay(300).then(async ()=>{
                ${opts.type||"custom"}button.click();
                const pw = document.getElementById("hash-word").value;
                await navigator.clipboard.writeText(pw);
                tri.excmds.fillcmdline_nofocus("Copied password for ${s}: "+pw)
                return pw;
            });
        `;
        const hashCallback = s ? setup+generate : setup+"sitetag.focus();";
        const pw = await utils.tab.openAndRun("http://localhost:8036/password-hasher.html", hashCallback, opts);
        if (opts.returnTabNumber && s) {
            await utils.tab.switch(opts.returnTabNumber, !opts.keepOpen);
            setTimeout(async () => {
                tri.excmds.fillcmdline_nofocus(`Copied password for ${s}: ${pw}`);
            }, 300);
        }
        return pw;
    },

    hashSite: async function(opts={}) {
        opts = utils.tri.parseOpts(opts,{
            castBoolean: "keepOpen",
            castNumber: "count",
        });
        if (opts?.count > 1) opts.keepOpen = true;
        const domain = tri.contentLocation.hostname;
        const simpl_domain = domain.replace(/(www|signin|reg|id|accounts)\./, "");
        const decoded_domain = decodeURIComponent(simpl_domain);
        const thisTab = await tri.webext.activeTab();
        const thisTabOrd = thisTab.index +1;
        opts.returnTabNumber ||= thisTabOrd;
        return this.hash(decoded_domain, opts);
    },
};

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
