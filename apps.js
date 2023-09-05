// ╭────────────────────────────────────────────╮
// │ apps.js -- Application code for .tridactyl │
// ╰────────────────────────────────────────────╯

var apps = {
    /** :convertunits UNIT
     *  :convertunits UNIT1 UNIT2
     *  :convertunits N UNIT1 [UNIT2]
     *  :convertunits N_UNIT1 [UNIT2]   -- no space between value and unit
     *  :convertunits (N1 N2 ...)[[ ]UNIT1 [UNIT2]]   -- replace value with parenthesized list of values
     */
    convertUnits: async function(args) {
        args = args.filter(a=> a.trim()!== "");
        var n=1, unit1="", unit2="";
        const argstr = args.join(" ").trim();
        const argMatch = argstr.match(/^\((.*)\)(.*)/);
        if (argMatch) {
            const vals = argMatch[1].split(/ +/);
            const rest = argMatch[2].split(/ +/);
            var subresults = [];
            for (const x of vals) { subresults.push(await apps.convertUnits([x, ...rest])); }
            return subresults.join("\t");
        }
        else if (args.length==1) {
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
        const res = await tri.native.run(shell.singQEscape(args.join(" ")));
        fillcmdline_nofocus(res.content.replace(/\n/g, "   "));
        return res.content;
    },

    openWith: async function(file, cmd) {
        const resolved_cmd = sprintf(cmd, `'${file}'`);
        const final_cmd = resolved_cmd == cmd
              ? `${cmd} '${file}'`
              : resolved_cmd;
        return tri.native.run(final_cmd);
    },

    openWithWr: async function(file, cmdterms) { return this.openWith(file, cmdterms.join(" ").trim()); },

    /* optionally takes a count after the command, used to choose a file via callback */
    openNthWithWr: async function(callback, rawargs) {
        const [cmdterms, count] = utils.tri.parseArgsAndCount(rawargs);
        const cmd = cmdterms.join(" ").trim();
        const file = await callback(count||1);
        return this.openWith(file, cmd);
    },

    unicodeHexcodes: function(s) {
        return fillcmdline_nofocus(Array.from(s).map(c => c.charCodeAt(0).toString(16)).join(" "));
    },

    unicode: async function(args) {
        const s = utils.tri.parseArgs(args, "str");
        if (s.length == 1) {
            return tri.controller.acceptExCmd(`!! unicode ${s} | sed 's/\s+/ /g'`);
        } else {
            const res = await tri.native.run(`unicode ${s}`);
            return utils.msg(res.content);
        }
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
        const pw = await utils.tab.openAndRun(
            "http://localhost:8721/webapps/password-hasher.html",
            hashCallback,
            opts
        );
        if (opts.returnTabNumber && s) {
            await utils.tab.switch(opts.returnTabNumber, !opts.keepOpen);
            setTimeout(async () => {
                tri.excmds.fillcmdline_nofocus(`Copied password for ${s}: ${pw}`);
            }, 300);
        }
        return pw;
    },

    /** hashSite(): hash() wrapper for :pwhash command
     *    opts.count: count supplied:
     *      1 (default) -- close pwhasher tab & return
     *      2           -- keep open & return
     *      3           -- keep open, don't return
     */
    hashSite: async function(opts={}) {
        opts = utils.tri.parseOpts(opts,{
            castBoolean: "keepOpen",
            castNumber: "count",
        });
        if (opts?.count > 1) opts.keepOpen = true;
        const domain = tri.contentLocation.hostname;
        const simpl_domain = domain.replace(/(www|signin|reg|id|(my)?accounts)\./, "");
        const decoded_domain = decodeURIComponent(simpl_domain);
        const thisTab = await tri.webext.activeTab();
        const thisTabOrd = thisTab.index +1;
        opts.returnTabNumber ||= thisTabOrd;
        if (opts.count==3) opts.returnTabNumber = null;
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
