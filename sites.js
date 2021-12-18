var sites = {
    gh: {
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
            return formatStr.
                replace(/\$\{u\}/g, u).
                replace(/\$\{r\}/g, r).
                replace(/\$\{a\}/g, a).
                replace(/\$\{u\/r\}/g, u+"/"+r).
                replace(/\$\{s\}/g, opts.query||"");
        },

        openOrSummon(f_url, opts={}) {
            const url = this.format(f_url);
            return utils.tab.openOrSummon(url, {where: opts.where||"here"});
        },

        search(f_url, description, query, opts={}) {
            const url = this.format(window._ghsearchurl, {query: query});
            return utils.tab.openOrSummon(url, {where: opts.where||"here"});
        },

        searchWrapper: function(args, opts={}) {
            const pref = opts.where=="related" ? "tab" : "";
            const descript = args.slice(1, -1).join("_").slice(1,-1);
            const f_url = args.slice(-1)[0];
            window._ghsearchurl = f_url;
            return tri.excmds.fillcmdline(`gh${pref}search <${descript}>`);
        },

    },
};

window.sites = sites;
