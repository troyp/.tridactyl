// ───────────────────────────────────────────────────────────────────────────────
// ╭────────╮
// │        │
// │  URLs  │
// │        │
// ╰────────╯

/** note: tri.urlutils provides the following methods to content scripts:
 *  - deleteQuery()
 *  - getAbsoluteURL()
 *  - getDownloadFilenameForUrl()
 *  - getUrlParent()
 *  - getUrlRoot()
 *  - graftUrlPath()
 *  - incrementUrl()
 *  - interpolateSearchItem()
 *  - replaceQueryValue()
 *  - setQueryValue()
 */

var urls = {
    urlRe: new RegExp(
        "(?<scheme>[^/]+)//"
            + "(?<domain>([^./]+\\.)*[^./]+)/"
            + "(?<path>([^/?#]+\\/?)*\\/*)"
            + "([?](?<query>[^/#]+))?"
            + "(#(?<fragment>.*))?"
    ),

    hostnameRe: new RegExp(
        "(?<subdomains>([^.]+\\.)+)"
            + "(?<domain>[^.]+)\\."
            + "(?<maybetld>com|org|net|int|edu|gov|mil)"
            + "\\.(?<cctld>[a-z][a-z])?",
        "i"
    ),

    // ╭──────────────╮
    // │ URL prefixes │
    // ╰──────────────╯
    /** opts.countSubdomains:   treat subdomains as levels
     */
    getNthFromRootPath: function(n=1, url=tri.contentLocation.href, opts={}) {
        const u = new URL(url);
        const hostnameRe = /(([^.]+\.)*)([^.]+)\.(com|org|net|int|edu|gov|mil)(\.[a-z][a-z])?/i;
        const domainMatch = u.hostname.match(hostnameRe);
        if (opts.countSubdomains && domainMatch) {
            /* subdomains */
            const Nr = domainMatch[2].split(".").length-1; /* # removable subdomains */
            const N = u.hostname.split(".").length;
            if (n < Nr) {
                u.hostname = u.hostname.split(".").slice(-(N-(Nr-n))).join(".");
                u.pathname = u.search = u.hash = "";
                return u.href;
            } else {
                n -= Nr;
            }
        } else if (opts.stripSubdomains && domainMatch) {
            const m = domainMatch;
            u.hostname = `${m[3]}.${m[4]}${m[5]||""}`;
        }
        {
            /* path levels */
            const trimRe = /^\/|\/$/;
            const path = u.pathname.replace(trimRe, "").split("/");
            const N = path.length;
            const n_ = Math.min(n, N);
            u.pathname = path.slice(0,n_).join("/");
            n -= n_;
        }
        /* query and fragment */
        if (n < 1) u.search = "";
        if (n < 2) u.hash = "";

        return u.href;
    },
    fromRoot: (...args)=>urls.getNthFromRootPath(...args),

    matchToNthLevel: function(n=1, url1, url2=tri.contentLocation.href, opts={}) {
        return getNthFromRootPath(n, url1, opts) == getNthFromRootPath(n, url2, opts);
    },

    /** opts.countSubdomains:   treat subdomains as levels
     *  opts.countQuery         treat query as a level
     *  opts.countFragment      treat fragment as a level
     *  opts.countIndexhtml:    don't treat path/index.html as equivalent to path/
     */
    getNthParent: function(n=1, url=tri.contentLocation.href, opts={}) {
        if (n == 0) return url;
        opts.countFragment ??= true;
        opts.countQuery ??= true;
        opts.countSubdomains ??= true;
        const u = new URL(url);
        for (let i=n; i>0; --i) {
            /* first try removing fragment */
            if (opts.countFragment && u.hash)
                u.hash = "";
            /* next try removing query */
            else if (opts.countQuery && u.search)
                u.search = "";
            /* next try removing the last path component */
            else if (/\/[^/]+\/*$/.test(u.pathname)) {
                if (!opts.countIndexhtml && /index.html?$/.test(u))
                    u.pathname = u.pathname.replace(/index.html?$/, "");
                u.pathname = u.pathname.replace(/\/[^/]+\/*$/, "");
            }
            /* otherwise, try removing a subdomain */
            else if (opts.countSubdomains) {
                const labels = u.hostname.split(".");
                const hostnameRe = /([^.]+\.)+([^.]+)\.(com|org|net|int|edu|gov|mil)(\.[a-z][a-z])?/i;
                if (labels.length > 3)
                    u.hostname = labels.slice(1).join(".");
                else if (hostnameRe.test(u.hostname))
                    u.hostname = u.hostname.replace(/[^.]+\./, "");
            } else break;
        }
        /* if query and/or fragment weren't counted as levels, remove them anyway */
        u.hash = "";
        if (!opts.countFragment || !/\#/.test(url) || n > 1)
            u.search = "";
        return u.href;
    },

    /** Uses same interface as tridactyl's `urlmodify -g`.
     *  For n>=0, keep n path components after hostnameRe
     *  For n<0, -1 keeps whole path, -2 removes 1 level, etc
     */
    getPathPrefix: function(n=0, initurl=tri.contentLocation.href) {
        n = Number(n);
        const url = new URL(initurl);
        /* remove initial / from pathname - we don't need to replace it when setting pathname */
        const path = url.pathname.split("/").slice(1);
        const N = path.length;
        if (n < 0) n += N+1;
        url.pathname = path.slice(0, n).join("/");
        if (n < N) url.hash = "";
        if (n < N) url.search = "";
        return url.href;
    },

    // ╭─────────╮
    // │ queries │
    // ╰─────────╯
    delQuery: function(url, key) {
        url ||=tri.contentLocation.href;
        const u = new URL(url);
        const queries = u.search.slice(1).split("&");
        const queries_filtered = queries.filter(q => { const [k, v] = q.split("="); return (k!=key); });
        u.search = "?" + queries_filtered.join("&");
        return u.href;
    },

    getQuery: function(url, qPattern) {
        url ||=tri.contentLocation.href;
        const u = new URL(url);
        const queries = u.search.slice(1).split("&");
        for (const q of queries) {
            const [k, v] = q.split("=");
            if ((typeof qPattern == "string" && k.includes(qPattern)) || k.match(qPattern)) return v;
        };
        return null;
    },

    /** Return URL resulting from setting the query KEY to VALUE in the input URL.
     */
    setQuery: function(url, key, value) {
        url ||=tri.contentLocation.href;
        const u = new URL(url);
        const queries = u.search.slice(1).split("&");
        const q = queries.find(q => { const [k, v] = q.split("="); return (k==key); });
        if (q) { /* replace existing value */
            const regex = new RegExp(`\\b${key}=[^?&#]+`);
            u.search = u.search.replace(regex, `${key}=${value}`);
        } else { /* add new query */
            if (u.search) u.search = `${u.search}&${key}=${value}`;
            else u.search = `?${key}=${value}`;
        }
        return u.href;
    },

    toggleQuery: function(url, key, value1, value2="") {
        url ||=tri.contentLocation.href;
        const currentKey = urls.getQuery(url, key);
        var newurl;
        if (currentKey != value1)
            newurl = urls.setQuery(url, key, value1);
        else {
            if (value2 == null) newurl = this.delQuery(url, key);
            else newurl = this.setQuery(url, key, value2);
        }
        return newurl;
    },

    // ╭───────╮
    // │ other │
    // ╰───────╯

    contentType: async function(url=tri.contentLocation.href) {
        if (url==tri.contentLocation.href)
            return tri.excmds.js("document.contentType");
        else {
            const cmd = `curl -sI ${url} |grep -Pio '(?<=content-type: )[a-zA-Z0-9]+/[a-zA-Z0-9]+'`;
            const res = await tri.native.run(cmd);
            return (res.code==0) && res.content;
        }
    },

    toFilename: async function(url, opts={}) {
        url ||= tri.contentLocation.href;
        opts = utils.tri.parseOpts(opts, {castBoolean: "allowSpaces"});
        var name = (new URL(url))
            .pathname
            .replace(/\/?([#?].*)?$/, "")
            .split("/")
            .pop();
        name = decodeURIComponent(name);
        const extRe = /\.[a-zA-Z0-9]+$/;
        const m = url.match(extRe);
        content_type = await this.contentType(url);
        const ext = m?.[0] || content_type?.split('/').pop();
        if (ext) name = `${name}.${ext}`;
        if (!opts.allowSpaces) name = name.replace(' ', '_');
        return name;
    },

};

urls.mod = {
    graft: function(splicetext, n=0, initurl=tri.contentLocation) {
        return [urls.getPathPrefix(n, initurl), splicetext].join("/").replace(/(?<!:)\/\/+/g, "/");
    },

    /** graftOrSummon(splicetext, n, opts)    Graft the path SPLICETEXT onto current URL's domain,
     *                                        open or summon the resulting URL.
     *                                        Options are only passed if called from background page (:jsb)
    */
    graftOrSummon: async function(splicetext, n=0, opts={}) {
        const url = this.graft(splicetext, n);
        if (window.location.protocol == "moz-extension:")
            await utils.tab.openOrSummon(url, opts);
        else
            tri.controller.acceptExCmd(`openorsummon ${url}`);
    },

    delComponent: function(...components) {
        const url = new URL(tri.contentLocation);
        for (const c of components)
            url[c] = "";
        tri.controller.acceptExCmd(`open ${url}`);
    },

    /** urltoggle(s1, s2, url)                Replace s1 with s2, or else s2 with s1
     *  urltoggle(s1, s2, url, {re1, re2})    Replace regex1 with s2, or else regex2 with s1
     */
    toggle: function(s1, s2, url=tri.contentLocation, opts={}) {
        url = String(url);
        const patt1 = opts.re1 || s1;
        const patt2 = opts.re2 || s2;
        const test = opts.re1 ? url.match(opts.re1) : url.includes(s1);
        const newurl = test
              ? url.replace(patt1, s2)
              : url.replace(patt2, s1);
        return newurl;
    },

    togglepage: function(s1, s2, ...rest) {
        var re1, re2, flags1="", flags2="";
        if (rest.length==4)
            [re1, flags1, re2, flags2] = rest;
        else
            [re1, re2] = rest;
        if (re1)
            re1 = flags1 ? RegExp(re1|"", flags1||"") : RegExp(re1||"");
        if (re2)
            re2 = flags2 ? RegExp(re2|"", flags2||"") : RegExp(re2||"");
        const url = tri.contentLocation.href;
        const newUrl = this.toggle(s1, s2, url, {re1: re1, re2: re2});
        if (newUrl && newUrl!==url) {
            if (window.location.protocol == "moz-extension:")
                tri.controller.acceptExCmd(`open ${newUrl}`);
            else
                window.location.replace(newUrl);
        }
    },

    toggleQuery: function(key, value1, value2) {
        const url = tri.contentLocation.href;
        var newurl;
        if (urls.getQuery(url, key) != value1)
            newurl = urls.setQuery(url, key, value1);
        else
            newurl = urls.setQuery(url, key, value2);
        tri.controller.acceptExCmd(`js window.location = "${newurl}"`);
    },

    toggleWr: function(argstr, opts={}) {
        const args = cutils.tri.parseArgs(argstr, "array");
        if (opts.global) {
            const [s1, s2] = args;
            const [r1, r2] = args.map(s=>new RegExp(s, "g"));
            return this.togglepage(s1, s2, r1, r2);
        } else {
            return this.togglepage(...args.map(s=>S.toStringOrRegex(s)));
        }

        return this.togglepage();
    },

};

window.urls = urls;
