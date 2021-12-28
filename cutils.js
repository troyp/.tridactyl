// ╭───────────────────────────────────────────────────────────╮
// │ cutils.js -- utility functions for content script context │
// ╰───────────────────────────────────────────────────────────╯

var cutils = {

    /**   $$(SELECTOR)
     *    $$(SELECTOR, {context: CONTEXT})
     *    $$(SELECTOR, CONTEXT)
     *  Return an array of elements in subtree CONTEXT matching SELECTOR.
     *  if CONTEXT is omitted, the root document and all frames are searched.
     */
    $$: function(selector, opts={}) {
        if (opts instanceof Node) opts = {context: opts};
        const getElems = (sel, top) => [...top.querySelectorAll(sel)];
        if (opts.context) {
            return getElems(selector, opts.context);
        } else {
            const res = getElems(selector, document);
            const frames = tri.dom.getAllDocumentFrames();
            for (f of frames) {
                try {
                    res.push(getElems(selector, frame.contentDocument||frame.contentWindow.document));
                } catch(_) {};
            }
            return res;
        }
    },

    /** Return an element in subtree CONTEXT matching SELECTOR, or null if there are none.
     *  See $$ above.
     */
    $1: function(selector, opts={}) {
        if (opts instanceof Node) opts = {context: opts};
        const getElem = (sel, top) => top.querySelector(sel);
        const res = getElem(selector, opts.context||document);
        if (res || opts.context) {
            return res;
        } else {
            const frames = tri.dom.getAllDocumentFrames();
            for (f of frames) {
                try {
                    const res = getElem(selector, frame.contentDocument||frame.contentWindow.document);
                    if (res) return res;
                } catch(_) {};
            }
        }
        return null;
    },

    /**   $$t(SELECTOR, TEXT)
     *    $$t(SELECTOR, TEXT, {context: CONTEXT})
     *    $$t(SELECTOR, TEXT, CONTEXT)
     *  Return an array of elements in subtree CONTEXT matching SELECTOR and matching TEXT.
     *  TEXT may be either a string or a regular expression.
     */
    $$t: function(selector, text, opts={}) {
        if (opts instanceof Node) opts = {context: opts};
        const elems = this.$$(selector, opts);
        return elems.filter(e=>e[opts.useInnerText ? "innerText" : "textContent"].match(text));
    },

    /** Return an element in subtree CONTEXT matching SELECTOR and matching TEXT.
     */
    $1t: function(selector, text, opts={}) {
        if (opts instanceof Node) opts = {context: opts};
        const elems = this.$$(selector, opts);
        return elems.find(e=>e[opts.useInnerText ? "innerText" : "textContent"].match(text));
    },

    /** Clicks matching element(s). If successful, returns an array of clicked items.
     *  If unsuccessful, returns null.
     */
    click: function(selector, opts={}) {
        const elts = opts.match
              ? $$(selector)
              : $$t(selector, opts.match, {useInnerText: opts.useInnerText});
        if (elts.length) {
            if (opts.all) {
                elts.forEach(e=>e.click());
                return elts;
            }
            else {
                elts[0].click();
                return elts.slice(0,1);
            }
        } else {
            return null;
        }
    },


    extractTableColumns: function(table, columns, opts={}) {
        var output = "";
        const rows = Array.from(table.rows).slice(1);
        const n = rows[0].cells.length;
        for (const row of rows) {
            const cells = Array.from(row.cells);
            if (opts.strict && cells.length < Math.max(...columns))
                continue;
            function processCols(i) {
                if (i < 0) { i = n+1-i; }
                const cellValue = cells[i-1] && cells[i-1].innerText.trim();
                if (cellValue.match?.(/^".*"$/))
                    return cellValue.slice(1, -1).trim();
                else
                    return cellValue;
            }
            const colstrs = Array.from(columns).map(processCols);
            output += colstrs.join("\t") + "\n";
        }
        return output;
    },

    isolate: function(...selectors) {
        const keepElts = $$(["head", ...selectors].join(","));
        for (elt of $$("*")) {
            if (keepElts.every(k => !k.contains(elt) && !elt.contains(k)))
                elt.remove();
        }
    },

    message: function(s, opts={}) {
        const s_ = (opts.prefix || "") + s;
        if (opts.temp) {
            const t = opts.duration || 3000;
            tri.excmds.fillcmdline_tmp(s_, t);
        } else if (opts.useAlert) {
            alert(s_);
        } else {
            tri.excmds.fillcmdline_nofocus(s_);
        }
        return s;
    },

    /**    rm(selector, opts):                     Remove matching elements
     *     rm(selector, context:HTMLElement):      Remove matching elements under CONTEXT
     *     rm(selector, ["firstMatch"]:[string]):  Remove first matching element
     *     rm(selector, filter:e=>Bool):             Remove matching elements satisfying predicate FILTER
     *     rm(selector, pattern:string|RegExp):    Remove matching elements with text matching PATTERN
     *  opts.filter:        predicate that selected elements must satisfy
     *  opts.firstMatch:    only remove the first matching element
     *  opts.context:       the root element of the search; null for whole document
     *  opts.match:         a regex or string that selected elements must match;
     *  opts.useInnerText   opts.match tests against elements' innerText property rather than textContent
     */
    rm: function(selector, opts={}) {
        /* selector */
        if (Array.isArray(selector))
            selector = selector.join(",");
        /* opts */
        if (Array.isArray(opts)) opts = opts.reduce((acc,e)=>(acc[e]=true) && acc, {});
        else if (opts instanceof HTMLElement) opts = { context: opts };
        else if (opts instanceof RegExp)      opts = { match: opts };
        else if (typeof opts === "function")  opts = { filter: opts };
        else if (typeof opts === "string")    opts = { match: opts };
        /* pred */
        function pred(e) {
            const textProp = opts.useInnerText ? "innerText" : "textContent";
            const match_ok  = !opts.match  || e[textProp].match(opts.match);
            const filter_ok = !opts.filter || opts.filter(e);
            return match_ok && filter_ok;
        }
        /* main logic */
        if (opts.firstMatch) {
            if ((elt = $$(selector, opts.context).find(pred))) {
                elt.remove();
                return elt;
            } else
                return null;
        }
        else {
            const elts = $$(selector, opts.context).filter(pred);
            elts.forEach(e=>e.remove());
            return elts.length ? elts : null;
        }
    },

    rmall: (...selectors)=>rm(selectors),

    /* urltoggle(s1, s2, url)                Replace s1 with s2, or else s2 with s1
     * urltoggle(s1, s2, url, {re1, re2})    Replace regex1 with s2, or else regex2 with s1
     */
    urltoggle: function(s1, s2, url, opts={}) {
        const patt1 = opts.re1 || s1;
        const patt2 = opts.re2 || s2;
        if (opts.re1 ? url.match(opts.re1) : url.includes(s1))
            return url.replace(patt1, s2);
        else
            return url.replace(patt2, s1);
    },

    urltoggleWrapper: function(argstr) {
        const args = argstr.trim().split(/ +/);
        [s1, s2, ...opts] = args;
        var restr1, flags1, restr2, flags2;
        if (opts.length==4)
            [restr1, flags1, restr2, flags2] = opts;
        else
            [restr1, restr2, flags1, flags2] = opts;
        const re1 = restr1 ? RegExp(restr1, flags1||"") : null;
        const re2 = restr2 ? RegExp(restr2, flags2||"") : null;
        const url = window.location.href;
        const newUrl = this.urltoggle(s1, s2, url, {re1: re1, re2: re2});
        if (newUrl && newUrl!==url) window.location.replace(newUrl);
    },

    yankWithMsg: function(s, opts={}) {
        tri.excmds.yank(s);
        const defaultPrefix = "Copied" + (opts.useAlert ? "...\n" : ": ");
        opts.prefix ??= defaultPrefix;
        this.message(s, opts);
    },
};

window.cutils = cutils;
for (k of Object.keys(cutils))
    window[k] = cutils[k];

