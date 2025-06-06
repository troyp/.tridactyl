var sites = {
    load: async function(module) {
        try {
            source(`~/.tridactyl/sites/${module}.tri`);
        } catch(e) {};
        try {
            jsb("-r", `sites/${module}.js`);
        } catch(e) {};
    },

    removeSite: async function(url, mode="normal") {
        const modemaps = {
            "normal": "nmaps",
            "ignore": "ignoremaps",
            "insert": "imaps",
            "input": "inputmaps",
            "ex": "exmaps",
            "hint": "hintmaps",
            "visual": "visualmaps",
            "browser": "browsermaps",
        };
        const subconfigs = tri.config.USERCONFIG.subconfigs;
        const subconfig = subconfigs[url][modemaps[mode]];
        for (const k in subconfig)
            tri.controller.acceptExCmd(`reseturl ${url} --mode=${mode} ${k}`);
        return subconfig;
    },

    gh: {
        _site: "github.com",

        getAccountUser: function() {
            return user.username.github;
        },

        getUser: function() {
            return this.getUserAndRepo()?.[0] || this.getAccountUser();
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
        kanjiRegex: "[一-龥]",

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

        /** kanjiHintSearch: hint japanese text elements for kanji searching on jisho.org
         *
         *  Kanji selectors:
         *      .furigana+span.text  -- jisho result term with kanji
         *      .furigana+.unlinked  -- jisho term in examples with kanji
         *      .character.literal>a -- jisho kanji link on right
         *      .break-unit          -- jisho 'other forms'
         *      .ja-text             -- japanese.stackexchange kanji/kana term
         *      .t_nihongo_kanji     -- wikia span class
         *      #japanese-name       -- wikia with support GM script
         */
        kanjiHintSearch: function() {
            return composite(
                "hint -pipe" +
                    " .furigana+span.text,.furigana+.unlinked,.character.literal>a,rb,.ja-text,.break-unit," +
                    ".t_nihongo_kanji,span[lang=ja],#japanese-name" +
                    " innerText",
                "|",
                "jisho_kanjisearch"
            );
        },

        search: async function(s, opts={}) {
            s = utils.tri.parseArgs(s, "string");
            opts = utils.tri.parseOpts(opts, {
                castString: "where",
                defaults: {where: "related",},
            });
            if (opts.ignorecase) s = s.toLowerCase();
            return utils.tab.open(`http://jisho.org/search/${s}`, opts.where);
        },
    },

    reddit: {
        _site: "https://reddit.com",

        go: async function() {
            const url = tri.contentLocation.href;
            if (url.match("https://www.reddit.com/r/")) {
                return hint("h3");
            } else if (url == "https://www.reddit.com/subreddits") {
                return hint("-Jc", "a.title");
            } else {
                // return utils.tri.hintOpen(...this.get_linkselectors_all());
                return hint(
                    ...this.linkselectors,
                    ...this.linkselectors_nohref
                );
            }
        },

        linkselectors: [
            "a.title",
            "a.comments",
            "#header-bottom-left a",
            "#header-bottom-right a",
            ".contents a",
            ".contents button",
            "a.subbarlink",
        ],

        linkselectors_nohref: [
            "li.viewSource>a",
            "li.share>a",
            "li.link-save-button>a",
            ".hide-button>span>a",
        ],

        get_linkselectors_all: function() {
            return [
                ...this.linkselectors,
                ...this.linkselectors_nohref
            ];
        },

    },

    se: {
        _sites: [
            "stackexchange.com",
            "stackoverflow.com",
            "serverfault.com",
            "superuser.com",
            "askubuntu.com",
            "stackapps.com",
            "mathoverflow.net",
        ],

        /* TODO: convert these into general functions and move to top level */

        bindShowKey() {
            return this._sites.forEach(async site => {
                await bindurl(site, "--mode=normal", "c<C-h>", `showkeysurl ${site} c`);
            });
        },

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
        _site: "wikipedia.org",

        episodeList: async function (s, opts={}) {
            opts = utils.tri.parseOpts(opts, {castString:"where", defaults:{where: "last"}});
            const sConv = S.toTitleCase(s, {forceInitialCapital: true}).replace(/\s+/, "_");
            const url = `https://en.wikipedia.org/wiki/List_of_${sConv}_episodes`;
            utils.tab.open(url, opts);
        },

        getTopic: function(url=tri.contentLocation) {
            url = new URL(url);
            const q = k => url.searchParams.get(k);
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

        search: function(s, opts={}) {
            opts = utils.tri.parseOpts(opts, {castString: "where", defaults:{where: "related"}});
            const url = new URL(tri.contentLocation.href);
            const host = url.hostname;
            const search = `https://${host}/w/index.php?go=Go&search=${s}&title=Special%3ASearch&ns0=1`;
            utils.tab.open(search, opts);
        },
    },

};

sites.LISTS = {
    main: [
        "https://www.amazon.com.au/gp/cart/view.html/ref=nav_cart",
        "https://cart.ebay.com.au",
    ],
    liquor_specials: [
        "https://www.danmurphys.com.au/current-offers?filters=variety(spirits)",
        "https://www.liquorland.com.au/specials/spirit-specials",
        "https://www.vintagecellars.com.au/specialoffers/spirit-specials",
        "https://bws.com.au/productgroup/spirit-specials",
        "https://www.firstchoiceliquor.com.au/specials",
    ],
    orders: [
        "https://www.ebay.com.au/mye/myebay/purchase",
        "https://www.amazon.com.au/gp/css/order-history/ref=nav_nav_orders_first",
    ],
    supermarkets: [
        "https://www.woolworths.com.au/shop/mylists/reorder",
        "https://www.coles.com.au/bought-before",
    ],
};

window.sites = sites;
