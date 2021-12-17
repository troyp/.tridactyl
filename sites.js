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

        format: function(formatStr) {
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
                replace(/\$\{u\/r\}/g, u+"/"+r);
        },

        openOrSummon(args, formatStr) {
            const [f_url, count] = utils.tri.parseArgsAndCount(args, {type: "string"});
            const url = this.format(f_url);
            return utils.tab.openOrSummon(url, {where: count?"related":"here"});
        },
    },
};

window.sites = sites;
