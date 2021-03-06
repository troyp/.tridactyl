var sites = {
    dndb: {
        _site: "dndbeyond.com",

        follow: async function() {
            return hints.follow({
                switches: "-J",
                extraSelectors: [
                    ".collapsible-header",
                    ".ddbc-tab-list__nav-item",
                    "#open-indicator",
                    ".list-row-indicator",
                    ".class-spell-list-header",
                    ".ddb-market-checkout-form-address-same-input",
                    ".ddb-search-filter-item-wrapper",
                ]
            });
        },

        getContentGroup: async function(elt) {
            const section = elt.firstChild.firstChild.firstChild.getAttribute("data-testid");
            const itemElts = [...elt.children[1].getElementsByClassName("ct-inventory-item")];
            const items = itemElts.map(e=>e.getAttribute("data-testid"));
            return [section, items];
        },

        spellUrl: async function(name, opts={}) {
            name = name.trim();
            const firstLetter = name[0];
            const id = S.toTitleCase(name).replace(/ +/g, "");
            return `https://www.dndbeyond.com/sources/phb/spell-descriptions-c#${id}`;
        },

        yankContentGroup: async function(elt) {
            const [section, items] = await this.getContentGroup();
            cutils.yank(`${section}:\n${items.join("\n")}`);
        },
    },

    gh: {
        _site: "github.com",

        getAccountUser: function() {
            return user.username.github;
        },

        getUser: function() {
            return ghGetUserAndRepo()?.[0] || this.getAccountUser();
        },

        getUserAndRepo: function(url) {
            url ||= tri.contentLocation.href;
            var match, user, repo;
            if (url.match(/https:\/\/github.com\/search/))
                return ["", ""];
            else if ((match=url.match(/https:\/\/([^/]+)\.github.io/)))
                return [match[1], ""];
            else {
                var regex = /[^:]+:\/\/(gist.)?github.com\/([^/?#]+)\/?([^/#?]+)?(\/.*)?/;
                match = url.match(regex);
                if (match) {
                    user = match[2]!="new" && !match[2].startsWith("?") && match[2];
                    repo = match[3];
                } else {
                    /* github.io */
                    var regex_io = /[^:]+:\/\/([^/]+).github.io\/([^/]+)\/?/;
                    match = url.match(regex_io);
                    user = match && match[1];
                    repo = match && match[2];
                }
                if (user=="settings") user = this.getAccountUser();
                return [user||"", repo||""];
            }
        },

        format: function(formatStr, opts={}) {
            /* format(formatStr)
                   Return String formed by replacing ${u},${r},${a} with user, repo and
                   accountUser. Also permits ${u/r};
             */
            const [u,r] = this.getUserAndRepo();
            const a = this.getAccountUser();
            return formatStr
                .replace(/\$\{u\}/g, u)
                .replace(/\$\{r\}/g, r)
                .replace(/\$\{a\}/g, a)
                .replace(/\$\{u\/r\}/g, u+"/"+r)
                .replace(/\$\{s\}/g, opts.query||"");
        },

        /* Returns a String object containing the path to the raw README */
        /* Also contains a property `result._qualified_name` to be used as a filename */
        getReadme: async function() {
            const promiseRes = await browser.tabs.executeScript({
                code: 'document.getElementById("readme").getAttribute("data-tagsearch-path")'
            });
            const filename = promiseRes[0];
            const [user, repo] = this.getUserAndRepo();
            const path = new String(`https://raw.githubusercontent.com/${user}/${repo}/master/${filename}`);
            path._qualified_name = `${repo}-${filename}`;
            return path;
        },


        openOrSummon(f_url, opts={}) {
            const url = this.format(f_url);
            return utils.tab.openOrSummon(url, {where: opts.where||"here"});
        },

        search(f_url, description, query, opts={}) {
            const url = this.format(window._ghsearchurl, {query: query});
            return utils.tab.openOrSummon(url, {where: opts.where||"here"});
        },

        saveReadme: async function(dir, filename="") {
            return this.getReadme().then(
                f => exclaim("curl", f, ">", `/opt/doc/${f._qualified_name}`)
            );
        },

        searchWrapper: function(args, opts={}) {
            const pref = opts.where=="related" ? "tab" : "";
            const descript = args.slice(1, -1).join("_").slice(1,-1);
            const f_url = args.slice(-1)[0];
            window._ghsearchurl = f_url;
            return tri.excmds.fillcmdline(`gh${pref}search <${descript}>`);
        },

    },

    j: {
        kanjiRegex: "[???-???]",

        sel: {
            entry: "div.concept_light-representation>span.text,.character",
            radical: "li.radical.available,li.radical.selected",
            kanji: "div.concept_light-representation>span.text,.character,.unlinked",
        },

        surl: {
            sentences: "https://jisho.org/search/%s #sentences",
            kanji: "https://jisho.org/search/%s #kanji",
            weblio: "https://ejje.weblio.jp/content/%s",
        },

        hintOpen: async function(sel, urlTempl, opts={}) {
            opts.property ||= "textContent";
            sel = sites.j.sel[sel] || sel;
            urlTempl = sites.j.surl[urlTempl] || urlTempl;
            var hintargs = ["-pipe", sel, opts.property];
            if (opts.text) hintargs.unshift(`-f`, opts.text);
            else if (opts.regex) hintargs.unshift(`-fr`, opts.regex);
            var value = await hint(...hintargs);
            value = value.trim?.() ?? value;
            const url = urlTempl.replace("%s", encodeURIComponent(value));
            return value && utils.tab.open(url, opts);
        },
    },

    se: {
        _sites: [
            "https://[^./]*.stackexchange.com",
            "https://stackoverflow.com",
            "https://serverfault.com",
            "https://superuser.com",
            "https://askubuntu.com",
            "https://stackapps.com",
            "https://mathoverflow.net",
        ],

        bind: async function(...args) {
            args = utils.tri.parseTerms(args);
            const [mode, keys, ...excmd] = args;
            return this._sites.forEach(async site => {
                await bindurl(site, mode, keys, ...excmd);
            });
        },

        bind_: async function(...args) {
            args = utils.tri.parseTerms(args);
            const [mode, keys, desc, ...excmd] = args;
            return this.bind(mode, keys, ...excmd);
        },

        unbind: async function(mode, keys) {
            return this._sites.forEach(async site => {
                await unbindurl(site, mode, keys);
            });
        },

    },

    wool: {
        _site: "woolworths.com.au",

        search: async function(args, opts={}) {
            const term = utils.tri.parseArgs(args, "string");
            const url = `https://www.woolworths.com.au/shop/search/products?searchTerm=${term}`;
            return utils.tab.openOrSummon(url, opts);
        },

        openTracking: async function() {
            const urlRe = /https:\/\/www\.woolworths\.com\.au\/shop\/myaccount\/myorders\/(\d+)/;
            const orderNumber = tri.contentLocation.href.match(urlRe)?.[1];
            const trackUrl = `https://www.woolworths.com.au/shop/myaccount/trackmyorder?ordernumber=${orderNumber}`;
            return tri.excmds.exclaim(`google-chrome ${trackUrl}`);
        },
    },

    wp: {
        _site: "github.com",

        episodeList: async function (s, opts={}) {
            opts = utils.tri.parseOpts(opts, {castString:"where", defaults:{where: "last"}});
            const sConv = S.toTitleCase(s, {forceInitialCapital: true}).replace(/\s+/, "_");
            const url = `https://en.wikipedia.org/wiki/List_of_${sConv}_episodes`;
            utils.tab.open(url, opts);
        },

        getTopic: function() {
            const url = new URL(tri.contentLocation);
            q = k => url.searchParams.get(k);
            var topic = null;
            if (url.pathname == "/w/index.php") {
                if  (q("title").match(/Special(:|%3A)Search/))
                    topic = q("search");
                else if (q("action"))
                    topic = q("title");
            } else if (url.pathname.startsWith("/wiki/")) {
                topic = url.pathname.match(/\/wiki\/([A-Za-z]+:)?(.*)/)?.[2];
            }
            return decodeURIComponent(topic?.replace(/_/g, " "));
        },
    },
};

sites.LISTS = {
    liquor_specials: [
        "https://www.danmurphys.com.au/current-offers?filters=variety(spirits)",
        "https://www.liquorland.com.au/specials/spirit-specials",
        "https://www.vintagecellars.com.au/specialoffers/spirit-specials",
        "https://bws.com.au/productgroup/spirit-specials",
        "https://www.firstchoiceliquor.com.au/specials",
    ],
    video_apps: [
        "https://www.netflix.com/",
        "https://www.primevideo.com/",
        "https://www.youtube.com/",
    ],
};

window.sites = sites;
