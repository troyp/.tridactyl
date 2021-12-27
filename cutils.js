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
        var rows = Array.from(table.rows).slice(1);
        var n = rows[0].cells.length;
        for (var row of rows) {
            var cells = Array.from(row.cells);
            if (opts.strict && cells.length < Math.max(...columns))
                continue;
            function processCols(i) {
                if (i < 0) { i = n+1-i; }
                var cellValue = cells[i-1] && cells[i-1].innerText.trim();
                if (cellValue.match?.(/^".*"$/)) cellValue = cellValue.slice(1, -1).trim();
                return cellValue;
            }
            var colstrs = Array.from(columns).map(processCols);
            output += colstrs.join("\t") + "\n";
        }
        return output;
    },

    message: function(s, opts={}) {
        var s_ = (opts.prefix || "") + s;
        if (opts.temp) {
            let t = opts.duration || 3000;
            tri.excmds.fillcmdline_tmp(s_, t);
        } else if (opts.useAlert) {
            alert(s_);
        } else {
            tri.excmds.fillcmdline_nofocus(s_);
        }
        return s;
    },

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
        var args = argstr.trim().split(/ +/);
        [s1, s2, ...opts] = args;
        var restr1, flags1, restr2, flags2;
        if (opts.length==4) [restr1, flags1, restr2, flags2] = opts;
        else [restr1, restr2, flags1, flags2] = opts;
        var re1 = restr1 ? RegExp(restr1, flags1||"") : null;
        var re2 = restr2 ? RegExp(restr2, flags2||"") : null;
        var url = window.location.href;
        var newUrl = this.urltoggle(s1, s2, url, {re1: re1, re2: re2});
        if (newUrl && newUrl!==url) window.location.replace(newUrl);
    },

    yankWithMsg: function(s, opts={}) {
        tri.excmds.yank(s);
        var defaultPrefix = "Copied" + (opts.useAlert ? "...\n" : ": ");
        opts.prefix ??= defaultPrefix;
        this.message(s, opts);
    },
};

window.cutils = cutils;
window.$$ = cutils.$$;
window.$1 = cutils.$1;
window.$$t = cutils.$$t;
window.$1t = cutils.$1t;
