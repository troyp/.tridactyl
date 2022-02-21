// ╭───────────────────────────────────────────────────────────╮
// │ cutils.js -- utility functions for content script context │
// ╰───────────────────────────────────────────────────────────╯

R = tri.R;

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

    $$cls: (classes, context=document) => [...context.getElementsByClassNames(classes)],
    $1cls: (classes, context=document) => context.getElementsByClassNames(classes)[0],
    $id: (id) => document.getElementById(id),
    $$tag: (tag, context=document) => [...context.getElementsByTagName(tag)],
    $1tag: (tag, context=document) => context.getElementsByTagName(tag)[0],

    /**   $$t(SELECTOR, TEXT)
     *    $$t(SELECTOR, TEXT, {context: CONTEXT})
     *    $$t(SELECTOR, TEXT, CONTEXT)
     *  Return an array of elements in subtree CONTEXT matching SELECTOR and matching TEXT.
     *  TEXT may be either a string or a regular expression.
     *  Options:
     *    opts.textProperty: property used to extract elements' text to match (default: "innerText")
     */
    $$t: function(selector, text, opts={}) {
        if (opts instanceof Node) opts = {context: opts};
        opts.textProperty ||= "innerText";
        const elems = $$(selector, opts);
        return elems.filter(e=>e[opts.textProperty].match(text));
    },

    /** Return an element in subtree CONTEXT matching SELECTOR and matching TEXT.
     *  See $$t for details.
     */
    $1t: function(selector, text, opts={}) {
        if (opts instanceof Node) opts = {context: opts};
        opts.textProperty ||= "innerText";
        const elems = $$(selector, opts);
        return elems.find(e=>e[opts.textProperty].match(text));
    },

    /** Clicks matching element(s). If successful, returns an array of clicked items.
     *  If unsuccessful, returns null.
     */
    click: function(selector, opts={}) {
        opts.firstMatch = !opts.all;
        delete opts.all;
        const elts = cutils.get(selector, opts);
        elts?.forEach(e=>e.click());
        return elts?.length > 0 && elts;
    },

    clickall: (selector, opts={}) => cutils.click(selector, {...opts, all:true}),

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

    /**   get(selector, opts)
     *    get(selector, context:HTMLElement)
     *    get(selector, ["firstMatch"]:[string])
     *    get(selector, filter:e=>Bool)
     *    get(selector, pattern:string|RegExp)
     *  Get matching elements.
     *  Options:
     *    opts.filter:        predicate that selected elements must satisfy
     *    opts.firstMatch:    only get the first matching element
     *    opts.context:       the root element of the search; null for whole document
     *    opts.match:         a regex or string that selected elements must match;
     *    opts.textProperty   property that opts.match tests against (default: "innertext")
     *    opts.returnParent   return the parents (or nth ancestors) of the matched elements
     */
    get: function(selector, opts={}) {
        /* selector */
        selector = [selector].flat(1).join(",");
        /* opts */
        opts = cutils.tri.parseOpts(opts, {
            castHTMLElement: "context",
            castString: "match",
            castRegExp: "match",
            castFunction: "filter",
            castArrayToBooleanOpts: true,
        });
        function getParent(e, n) {
            if (n==0) return e;
            else return getParent(e.parentElement, n-1);
        };
        /* pred */
        function pred(e) {
            const match_ok  = !opts.match  || e[opts.textProperty].match(opts.match);
            const filter_ok = !opts.filter || opts.filter(e);
            return match_ok && filter_ok;
        }
        /* main logic */
        if (opts.firstMatch) {
            const elt = $$(selector, opts.context).find(pred);
            if (elt)
                return opts.returnParent ? getParent(elt, opts.returnParent) : elt;
            else
                return [];
        } else {
            const elts = $$(selector, opts.context).filter(pred);
            return opts.returnParent
                ? elts.map(e=>getParent(e, opts.returnParent))
                : elts;
        }
    },

    getSelectionDOM: function() {
        var str = getSelectionHtml();
        var parser = new DOMParser();
        return parser.parseFromString(str, "text/html");
    },

    getSelectionHtml: function() {
        const sel = window.getSelection();
        var contents = document.createElement("div");
        for (let i=0; i<sel.rangeCount; ++i) {
            const fragment = sel.getRangeAt(i).cloneContents();
            contents.appendChild(fragment);
        }
        return contents.innerHTML;
    },

    getText: function(selector, opts={}) {
        opts = cutils.tri.parseOpts(opts, {castString: "textProperty"});
        opts.textProperty ??= "innerText";
        return cutils.get(selector, opts).map(e=>e[opts.textProperty]).join("\n");
    },

    getText1: function(selector, opts={}) {
        opts = cutils.tri.parseOpts(opts, {castString: "textProperty"});
        opts.textProperty ??= "innerText";
        opts.firstMatch = true;
        const elt = cutils.get(selector, opts)[0];
        return elt && elt[opts.textProperty];
    },

    /** Hides elements matching SELECTOR. See get() for arguments and options */
    hide: function(selector, opts={}) {
        const elts = cutils.get(selector, opts);
        if (opts.toggle) elts.forEach(e=>{
            if (e.classList.contains("TridactylKilledElem"))
                e.classList.remove("TridactylKilledElem");
            else
                e.classList.add("TridactylKilledElem");
        });
        else elts.forEach(e=>e.classList.add("TridactylKilledElem"));
        return elts.length ? elts : null;
    },

    /** Hides elements matching any of the SELECTORS. For more options, see rm() */
    hideall: (...selectors) => cutils.hide(selectors),

    /**   isolate(selector, opts)
     *    isolate(selector, context:HTMLElement)
     *    isolate(selector, ["firstMatch"]:[string])
     *    isolate(selector, filter:e=>Bool)
     *    isolate(selector, pattern:string|RegExp)
     *  Remove all but matching elements.
     *  Options:
     *    opts.filter:        predicate that selected elements must satisfy
     *    opts.firstMatch:    only keep the first matching element
     *    opts.context:       the root element of the search; null for whole document
     *    opts.match:         a regex or string that selected elements must match;
     *    opts.textProperty:  property used to extract elements' text to match (default: "innerText")
     *    opts.noHead:        remove the <head> element
     *    opts.noCmdline:     remove Tridactyl's commandline iframe
     */
    isolate: function(selector, opts={}) {
        /* opts */
        if (Array.isArray(opts)) opts = opts.reduce((acc,e)=>(acc[e]=true) && acc, {});
        else if (opts instanceof HTMLElement) opts = { context: opts };
        else if (opts instanceof RegExp)      opts = { match: opts };
        else if (typeof opts === "function")  opts = { filter: opts };
        else if (typeof opts === "string")    opts = { match: opts };
        /* pred */
        function pred(e) {
            const match_ok  = !opts.match  || e[opts.textProperty].match(opts.match);
            const filter_ok = !opts.filter || opts.filter(e);
            return match_ok && filter_ok;
        }
        /* selector */
        if (Array.isArray(selector)) selector = selector.join(",");
        /* main logic */
        var keepElts = [];
        if (opts.firstMatch) {
            if ((elt = $$(selector, opts.context).find(pred))) {
                keepElts = [elt];
            } else
                return null;
        } else {
            keepElts = $$(selector, opts.context).filter(pred);
        }
        if (!opts.noHead) keepElts.push(document.head);
        if (!opts.noCmdline) keepElts.push(document.getElementById("cmdline_iframe"));
        var successful = null;
        for (elt of $$("*")) {
            if (keepElts.every(k => !k.contains(elt) && !elt.contains(k))) {
                elt.remove();
                successful = true;
            }
        }
        return successful;
    },

    keep: (...selectors) => this.isolate(selectors),

    message: function(s, opts={}) {
        const s_ = (opts.prefix || "") + s;
        if (opts.temp) {
            const t = opts.duration || 3000;
            fillcmdline_tmp(s_, t);
        } else if (opts.useAlert) {
            alert(s_);
        } else {
            fillcmdline_nofocus(s_);
        }
        return s;
    },

    /** Remove elements matching SELECTOR. See get() for arguments and options */
    rm: function(selector, opts={}) {
        const elts = cutils.get(selector, opts);
        elts.forEach(e=>e.remove());
        return elts.length ? elts : null;
    },

    /** Remove elements matching any of the SELECTORS. For more options, see rm() */
    rmall: (...selectors) => this.rm(selectors),

    select: async function(input, opts={}) {
        if (Array.isArray(input)) input = input.join("\n");
        opts = cutils.tri.parseOpts(opts, {defaults:{prompt:"", format:"s"}});
        const rofithemestr = '#window {width: 80%;} #listview {lines: 25;}';
        const rofithemeopt = `-theme-str '${rofithemestr}'`;
        const dmenuOpts = opts.multiSelect ? "-multi-select -i" : "-i";
        const prompt = [
            opts.prompt,
            opts.multiSelect ? "[Shift+ENTER:select, ENTER:return]" : "[ENTER:select]"
        ].join(" ");
        const inputcmd = opts.tempfile
              ? `cat ${opts.tempfile} | `
              : `dmenuin="$(cat <<'EOF'\n${input}\nEOF\n)"; echo "$dmenuin" | `;
        const cmd = `${inputcmd} rofi -dmenu ${rofithemeopt} -format ${opts.format} -p "${prompt}" ${dmenuOpts}`;
        const res = await tri.native.run(cmd);
        return res?.content.trim().split("\n");
    },

    /** Unhides elements matching SELECTOR. See get() for arguments and options */
    unhide: function(selector, opts={}) {
        const elts = cutils.get(selector, opts);
        elts.forEach(e=>e.className = e.className.replace("TridactylKilledElem", ""));
        return elts.length ? elts : null;
    },

    /** Unhides elements matching any of the SELECTORS. For more options, see rm() */
    unhideall: (...selectors) => cutils.unhide(selectors),

    yankby: (...args) => cutils.yank(this.getText(...args)),

    yank1by: function(selector, opts={}) {
        const text = this.getText1(selector, opts);
        return text!==null && cutils.yank(text);
    },

    yankelt: function(elts, opts={}) {
        /* options */
        opts = cutils.tri.parseOpts(opts, {castString: "textProperty"});
        opts.textProperty ??= "innerText";
        /* yank */
        function getText(e) {
            switch (e.tagName.toLowerCase()) {
              case "input": return e.value; break;
              default: return e[opts.textProperty];
            }
        }
        cutils.yank(elts.map(e=>getText(e)).join("\n"), opts);
    },

    yank: function(s, opts={}) {
        /* options */
        opts = cutils.tri.parseOpts(opts, {castBoolean: "msg"});
        opts.msg ??= true;
        /* yank */
        yank(s);
        /* message? */
        if (opts.msg) {
            opts.prefix ??= "Copied" + (opts.useAlert ? "...\n" : ": ");
            cutils.message(s, opts);
        }
    },
};

// ───────────────────────────────────────────────────────────────────────────────
// ╭───────────────────────────────╮
// │ cutils.style -- CSS utilities │
// ╰───────────────────────────────╯

cutils.css = {
    /* add rules to sheet SHEETID. Each rule is a pair [SELECTOR, DECLARATIONS] */
    /* DECLARATIONS is either a string or an object mapping properties to values */
    addRules: function(styleId, ...rules) {
        const s = document.getElementById(styleId).sheet;
        for (rule of rules) {
            const [selector, decls] = rule;
            const declStr = typeof decls == "string"
                  ? decls
                  : Object.keys(decl).map(k => `${k}: ${decl[k]}`).join("; ");
            s.insertRule(`${selector} { ${declStr} }`);
        }
        return s;
    },

    addSheet: function(id) {
        const style = document.createElement("style");
        style.id = id;
        const sheet = document.head.appendChild(style).sheet;
        return sheet;
    },

    toggle: function(id) {
        const style = document.getElementById(id);
        return style.disabled ^= true;
    },

    show: function(id) {
        alert(this.text(id));
    },

    text: function(id) {
        return [...document.getElementById(id).sheet.cssRules]
            .map(r=>r.cssText)
            .join("\n");
    },

    toggleOrCreate: function(id, ...rules) {
        const style = document.getElementById(id);
        return style
            ? style.disabled ^= true
            : this.addSheet(id) && this.addRules(id, ...rules);
    },
};

// ───────────────────────────────────────────────────────────────────────────────
// ╭──────────────────────────────────────────────────────────────────╮
// │ cutils.tri -- utilities related to tridactyl source and features │
// ╰──────────────────────────────────────────────────────────────────╯

cutils.tri = {
    parseArgs: function(args, opts={}) {
        /* opts */
        opts = this.parseOpts(opts, {castString: "type"});
        var result = null, callerOpts = {};
        if (opts.allowOpts && typeof args.at(-1) == "object") {
            [args, [callerOpts]] = tri.R.splitAt(-1, args);
        }
        /* args */
        if (typeof args == "string") args = [args];
        const argstr = args.join(" ").trim();
        switch (opts.type) {
          case "string":
              result = argstr; break;
          case "number":
              result = Number(argstr) || null;
          case "array":
          default:
              result = argstr.split(/ +/); break;
        }
        if (opts.allowOpts)
            return [result, callerOpts];
        else
            return result;
    },

    parseArgsAndCount: function(args, opts={}) {
        const n = args.length - 1;
        const hasCount = parseInt(args[n]) > 0;
        const countElem = hasCount && args.pop();
        const count = countElem && parseInt(countElem);
        return [this.parseArgs(args, opts), count];
    },

    /** options.castString:               if a string is passed for opts rather than an array, it
     *                                    represents the value of the property opts[options.castString].
     *  options.defaults.key=val:         if key if falsey, set to value
     *  options.nullishDefaults.key=val:  if key is nullish, set to value
     */
    parseOpts: function(rawopts, options={}) {
        /* cast opts */
        var opts = {};
        if (options.castString && typeof rawopts == "string") {
            opts[options.castString] = rawopts;
        } else if (options.castFunction && typeof rawopts == "function") {
            opts[options.castFunction] = rawopts;
        } else if (options.castBoolean && typeof rawopts == "boolean") {
            opts[options.castBoolean] = rawopts;
        } else if (options.castNumber && typeof rawopts == "number") {
            opts[options.castNumber] = rawopts;
        } else if (options.castHTMLElement && rawopts instanceof HTMLElement) {
            opts[options.castHTMLElement] = rawopts;
        } else if (options.castRegExp && rawopts instanceof RegExp) {
            opts[options.castRegExp] = rawopts;
        } else if (options.castArrayToBooleanOpts && Array.isArray(rawopts)) {
            opts = rawopts.reduce((acc,e)=>(acc[e]=true) && acc, {});
        } else {
            opts = rawopts;
        }
        /* defaults */
        options.defaults ||= {};
        options.nullishDefaults ||= {};
        for (k of Object.keys(options.defaults)) {
            opts[k] ||= options.defaults[k];
        }
        for (k of Object.keys(options.nullishDefaults)) {
            opts[k] ??= options.nullishDefaults[k];
        }
        /* return */
        return opts;
    },
};

window.cutils = cutils;
window.R = R;

[
    "$$", "$1", "$$cls", "$1cls", "$id", "$$tag", "$1tag", "$$t", "$1t",
    "click", "clickall",
    "getText", "getText1",
    "getSelectionDOM", "getSelectionHtml",
    "isolate", "keep", "rm", "rmall",
    "yankby", "yank1by", "yankelt",
].forEach(k => window[k]=cutils[k]);
