// ╭───────────────────────────────────────────────────────────╮
// │ cutils.js -- utility functions for content script context │
// ╰───────────────────────────────────────────────────────────╯

var R = tri.R;

var cutils = {

    /**   $$(SELECTOR)
     *    $$(SELECTOR, {context: CONTEXT})
     *    $$(SELECTOR, CONTEXT)
     *  Return an array of elements in subtree CONTEXT matching SELECTOR.
     *  if CONTEXT is omitted, the root document and all frames are searched.
     */
    $$: function(selector, opts={}) {
        opts = cutils.tri.parseOpts(opts, { castNode: "context", });
        selector = selector.replace(/^,+|,+$/, "").replace(/,,+/, ",");
        if (!selector) return [];
        const getElems = (sel, top) => [...top.querySelectorAll(sel)];
        if (opts.context) {
            return getElems(selector, opts.context);
        } else {
            const res = getElems(selector, document);
            const frames = tri.dom.getAllDocumentFrames();
            for (let f of frames) {
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
        selector = [selector].flat(1).join(",");
        if (opts instanceof Node) opts = {context: opts};
        const getElem = (sel, top) => top.querySelector(sel);
        const res = getElem(selector, opts.context||document);
        if (res || opts.context) {
            return res;
        } else {
            const frames = tri.dom.getAllDocumentFrames();
            for (let f of frames) {
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
        text ||= "";
        if (opts instanceof Node) opts = {context: opts};
        opts.textProperty ||= "innerText";
        const elems = $$(selector, opts);
        return elems.find(e=>e[opts.textProperty].match(text));
    },

    /**   $$match(SELECTOR, PROP, TEXT)
     *    $$match(SELECTOR, PROP, TEXT, {context: CONTEXT})
     *    $$match(SELECTOR, PROP, TEXT, CONTEXT)
     *  Return an array of elements in subtree CONTEXT matching SELECTOR, whose property PROP matches TEXT.
     *  TEXT may be either a string or a regular expression.
     */
    $$match: function(selector, text, opts={}) {
        if (opts instanceof Node) opts = {context: opts};
        opts.textProperty ||= "innerText";
        const elems = cutils.get(
            selector,
            {
                textProperty: prop,
                match: text,
                ...opts
            });
        return elems.filter(e=>e[opts.textProperty].match(text));
    },

    /** Clicks matching element(s). If successful, returns an array of clicked items.
     *  If unsuccessful, returns null.
     */
    click: function(selector, opts={}) {
        if (selector instanceof Node) return selector.click();
        else {
            opts.firstMatch = !opts.all;
            delete opts.all;
            const elts = cutils.get(selector, opts);
            elts?.forEach(e=>e.click());
            return elts?.length > 0 && elts;
        }
    },

    click1: function(selector, opts={}) {
        if (selector instanceof Node) {
            selector.click();
            return selector;
        }
        else {
            const elt = cutils.get1(selector, opts);
            elt?.click();
            return elt;
        }
    },

    clickall: (selector, opts={}) => cutils.click(selector, {...opts, all:true}),

    extractTblCols: function(table, columns, opts={}) {
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
                if (cellValue?.match?.(/^".*"$/))
                    return cellValue.slice(1, -1).trim();
                else
                    return cellValue;
            }
            const colstrs = Array.from(columns).map(processCols);
            output += colstrs.join("\t") + "\n";
        }
        return output;
    },

    /* choose table with hint and extract columns given by ARGS */
    copytablecols: async function(args, opts={}) {
        args = cutils.tri.parseArgs(args);
        opts.cmdline ??= false;    /* yank() will set cmdline to true if undefined is passed */
        const tbl = await tri.excmds.hint("-Jc", "table");
        const data = await this.extractTblCols(tbl, args, opts);
        return cutils.yank(data, {cmdline: opts.cmdline});
    },

    cbAppend: async function (s) {
        await tri.native.run(`echo '${s}' | xsel -aif`);
        const result = await tri.native.run(`xsel -o`);
        return result.content;
    },

    datetime: () => (new Date).toISOString().replace("T", "-").replace(/:[0-9.]+Z/, ""),

    ex: function(cmd) { return tri.controller.acceptExCmd(cmd); },

    /**   get(selector, opts)
     *    get(selector, context:Node)
     *    get(selector, "firstMatch"|"lastMatch")
     *    get(selector, filter:e=>Bool)
     *    get(selector, pattern:string|RegExp)
     *  Get matching elements.
     *  Options:
     *    opts.filter:        predicate that selected elements must satisfy
     *    opts.firstMatch:    [Bool] only get the first matching element
     *    opts.context:       the root element of the search; null for whole document
     *    opts.lastMatch:     [Bool] only get the last matching element
     *    opts.match:         a regex or string that selected elements must match;
     *    opts.textProperty   property that opts.match tests against (default: "innertext")
     *    opts.returnParent   return the parents (or nth ancestors) of the matched elements
     */
    get: function(selector, opts={}) {
        /* selector */
        selector = [selector].flat(1).join(",");
        /* opts */
        opts = cutils.tri.parseOpts(opts, {
            castNode: "context",
            castString: "match",
            castRegExp: "match",
            castFunction: "filter",
            castArrayToBooleanOpts: true,
            defaults: { "textProperty": "innerText", },
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
        var elts;
        if (opts.firstMatch || opts.lastMatch) {
            const elt = opts.firstMatch
                  ? $$(selector, opts.context).find(pred)
                  : $$(selector, opts.context).reverse().find(pred);
            elts = elt ? [elt] : [];
        } else {
            elts = $$(selector, opts.context).filter(pred);
        }
        return opts.returnParent
            ? elts.map(e=>getParent(e, opts.returnParent))
            : elts;
    },

    get1: function(selector, opts={}) {
        opts = cutils.tri.parseOpts(opts, {
            castNode: "context",
            castString: "match",
            castRegExp: "match",
            castFunction: "filter",
            castArrayToBooleanOpts: true,
            defaults: { "textProperty": "innerText", },
        });
        return cutils.get(selector, {firstMatch:true, ...opts})?.[0];
    },

    getSearchField: function(n) {
        const inputFields = cutils.get("input");
        const searchFields = inputFields.filter(
            e => e.placeholder.match(/search/i)
                || e["aria-label"] == "Search"
                || e.id == "search" || e.classList.contains("search")
        );
        return searchFields?.[n];
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
        opts.textProperty ||= "innerText";
        opts.trim ??= true;
        const contents = cutils.get(selector, opts).map(e=>e?.[opts.textProperty]);
        const ss = opts.trim ? contents.map(s=>s.trim()) : contents;
        return opts.returnArray? ss : ss.join("\n");
    },

    getText1: function(selector, opts={}) { return this.getText(selector, {firstMatch: true, ...opts}); },

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

    hover: async function(elt) {
        await tri.controller.acceptExCmd(`js -r js/pseudostyler.js`);
        let styler = new PseudoStyler();
        await styler.loadDocumentStyles();
        styler.toggleStyle(elt, ':hover');
    },

    /**   isolate(selector, opts)
     *    isolate(selector, context:Node)
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
        else if (opts instanceof Node) opts = { context: opts };
        else if (opts instanceof RegExp)      opts = { match: opts };
        else if (typeof opts === "function")  opts = { filter: opts };
        else if (typeof opts === "string")    opts = { match: opts };
        /* pred */
        function pred(e) {
            const match_ok  = !opts.match  || e[opts.textProperty].match(opts.match);
            const filter_ok = !opts.filter || opts.filter(e);
            return match_ok && filter_ok;
        }
        /* keepElts */
        var keepElts = [];
        if (Array.isArray(selector)) {
            if (selector.every(e => typeof e == "string")) {
                selector = selector.filter(identity).join(",");
            } else if (selector.length == 1 && selector[0] instanceof Node){
                selector = selector[0];
            }
        }
        if (selector instanceof Node) {
            keepElts = [selector];
        } else {
            keepElts = cutils.get(selector, opts);
        }
        if (!opts.noHead) keepElts.push(document.head);
        if (!opts.noCmdline) keepElts.push(document.getElementById("cmdline_iframe"));
        /* remove other elements */
        var successful = null;
        for (const elt of $$("*")) {
            if (keepElts.every(k => !k.contains(elt) && !elt.contains(k))) {
                elt.remove();
                successful = true;
            }
        }
        return successful;
    },

    isInViewport: function(e, opts={}) {
        const rect = e.getBoundingClientRect();
        const lowerBound = window.innerHeight || document.documentElement.clientHeight;
        const rightBound = window.innerWidth || document.documentElement.clientWidth;
        if (opts.checkHorizontal) {
            if (opts.partial) {
                if (!( rect.left < rightBound && rect.right > 0 )) return false;
            }
        }
        if (opts.topOnly) {
            return rect.top >= 0;
        } else if (opts.partial) {
            return rect.top < lowerBound && rect.bottom > 0;
        } else {
            return rect.top >= 0 && rect.bottom <= lowerBound;
        }
    },

    isDisplayed: function(e) { return Boolean(e.offsetParent); },

    jsinject: async function(code, opts={}) {
        opts = cutils.tri.parseOpts(opts, {
            castBoolean: "file",
            castNode: "doc",
        });
        const doc = opts.doc || document;
        if (opts.file) code = (await tri.native.read(code)).content;
        const script = doc.createElement("script");
        script.innerText = code;
        document.head.appendChild(script);
        /* script.parentNode.removeChild(script); */
    },

    kwrofi: async function(switches="-Swa") {
        return jsb(`places.kw.rofiGetKW("${switches}")`);
    },

    jumpToHeading: async function(selector="h2,h3,h4", opts={}) {
        opts = cutils.tri.parseOpts(opts, {defaults: {"indentHeadings": true}});
        const tableHeadings = $$(selector);
        function indent(t, base=2) {
            const match = t.match(/[Hh](\d)/);
            if (match) {
                const n = parseInt(match[1]);
                return `${t}: ${"──".repeat(n-base)}`;
            } else return `${t}:`;
        }
        const tableHeadingDescripts = tableHeadings.map(h=>`${indent(h.tagName)} ${h.textContent.trim()}`);
        const selectedIdx = await cutils.select(tableHeadingDescripts, {format: "i"});
        const selected = tableHeadings[selectedIdx];
        selected.scrollIntoView();
        return selected;
    },

    keep: (...selectors) => cutils.isolate(selectors),

    message: async function(s, opts={}) {
        opts = cutils.tri.parseOpts(opts, {castBoolean: "cmdline"});
        if (s instanceof Promise) s = await s;
        const s_ = (opts.prefix || "") + s;
        /* alert("MESSAGE() OPTS: " + JSON.stringify(opts)); */
        if (opts.temp || opts.duration) {
            const t = opts?.duration || 3000;
            fillcmdline_tmp(t, s_);
        } else if (opts.nofocus) {
            fillcmdline_nofocus(s_);
        } else if (opts.cmdline) {
            fillcmdline(s_);
        } else {
            alert(s_);
        }
        return s;
    },

    /*  OBJ, PROP1.PROP2...PROPN -> [OBJ.PROP1...PROPN-1, PROPN] */
    resolveComplexProperty: function(obj, propchain) {
        let props = typeof propchain == "string"
            ? propchain.split(".").reverse()
            : propchain;
        while (props.length > 1) obj = obj[props.pop()];
        return [obj, props[0]];
    },

    /** Remove elements matching SELECTOR. See get() for arguments and options */
    rm: function(selector, opts={}) {
        const elts = cutils.get(selector, opts);
        elts.forEach(e=>e.remove());
        return elts.length ? elts : null;
    },

    /** Remove elements matching any of the SELECTORS. For more options, see rm() */
    rmall: (...selectors) => cutils.rm(selectors),

    saveText: async function(eltOrSel, opts={}) {
        opts = cutils.tri.parseOpts(opts, {
            castString: "prop",
            defaults: {
                "prop": "innerText",
                "msg":  true,
                "dir":  "~/Downloads/tri",
            },
        });
        if (!opts?.name) {
            opts.name = await cutils.timestampFilename(document.title);
        }
        const file = `${opts.dir}/${opts.name}`;
        let elements;
        if (typeof eltOrSel == "string") {
            elements = $$(eltOrSel);
        } else if (eltOrSel instanceof Node) {
            elements = [eltOrSel];
        } else throw new Error("eltOrSel not a string or Node");
        const text = elements.map(e=>e[opts.prop]).join("\n");
        if (opts.alert) {
            cutils.message(text);
        } else if (opts.msg) {
            cutils.message(text, {cmdline:true});
        }
        /* alert("SAVETEXT() OPTS: " + JSON.stringify(opts)); */
        return tri.native.write(file, text);
    },

    saveURL: function(url, name) {
        url ||= document.location.href;
        name ||= "download-"+cutils.datetime();
        const link = document.createElement("a");
        document.body.appendChild(link);
        link.href = url; link.download = name;
        link.click();
        link.remove();
        return name;
    },

    scrollelt: function(selector) {
        const coords = $1(selector)?.getBoundingClientRect();
        return window.scrollTo(coords);
    },

    scrollNthIntoView: function(selector, n=1) {
        n = parseInt(n);
        return $$(selector)[n-1].scrollIntoView();
    },

    /**  select(items, opts): choose item from array with rofi
     *   Returns an array of strings or (for format "i" or "d") integers
     *     items: a string or iterable specifying a list of items
     *     opts.separator: if ITEMS is a string, specifies the string separating items
     *     opts.infile: a file to be used as input. The items are the lines of the file
     *     opts.multiSelect: boolean; if true, allows multiple items to be selected
     *     opts.prompt: prompt shown to user
     *     opts.format: output format
     *       s  -  selected string
     *       i  -  index, 0-based: 0...N-1
     *       d  -  index, 1-based: 1...N
     *       q  -  selected string, quoted
     *       f  -  filter string (user input)
     *       F  -  filter string (user input), quoted
     */
    select: async function(items, opts={}) {
        opts = cutils.tri.parseOpts(
            opts, {
                defaults:{prompt:"", format:"s"},
                castString: "format",
            }
        );
        if (typeof items == "string") {
            if (opts.separator && opts.separator != "\n") {
                items = items.replaceAll("\n", "\t").replaceAll(opts.separator, "\n");
            }
        } else {
            if (this.isIterable(items)) items = [...items];
            items = items?.join("\n");
        }
        const rofithemestr = '#window {width: 80%;} #listview {lines: 25;}';
        const rofithemeopt = `-theme-str '${rofithemestr}'`;
        const dmenuOpts = opts.multiSelect ? "-multi-select -i" : "-i";
        const prompt = [
            opts.prompt,
            opts.multiSelect ? "[Shift+ENTER:select, ENTER:return]" : "[ENTER:select]"
        ].join(" ");
        const inputcmd = opts.infile
              ? `cat ${opts.infile} | `
              : `dmenuin="$(cat <<'EOF'\n${items}\nEOF\n)"; echo "$dmenuin" | `;
        const cmd = `${inputcmd} ${tri.config.get("rofi")} -dmenu ${rofithemeopt} ` +
              `-format ${opts.format} -p "${prompt}" ${dmenuOpts}`;
        const res = await tri.native.run(cmd);
        if (opts.format=="i" || opts.format=="d")
            return res?.content.trim().split("\n").map(d=>parseInt(d)).filter(i=>!isNaN(i));
        else
            return res?.content.trim().split("\n");
    },

    setInput: function(elt, value) {
        if (!(elt instanceof Node)) elt = $1(elt);
        elt.value = value;
        elt.dispatchEvent(new Event("input"));
        elt.dispatchEvent(new Event("change"));
    },


    /* use `await sleep(ms)` in async function to delay execution */
    sleep: async function(ms) { return new Promise(res=>setTimeout(res, ms)); },

    sprintf: async function(...args) {
        return tri.excmds.jsb(`sprintf(...${JSON.stringify(args)})`);
    },

    timestampFilename: async function(title, opts={}) {
        opts = cutils.tri.parseOpts(opts, {
            castString: "extension",
            defaults: {
                "extension": "txt",
            },
        });
        await tri.excmds.js("-r", "js/sanitize-filename.js");
        if (sanitize) title = sanitize(title);
        else title = title.replace(/[\/:\|]/g, "-").replace(/[\*<>\?\\"]/g, "").replace("\n", " ");
        let filename = [title, cutils.datetime()].join("-");
        if (opts.extension) filename += `.${opts.extension}`;
        return filename;
    },

    toggleprop: async function(obj, prop, val1, val2="") {
        const val = obj[prop];
        if (val == val1) obj[prop] = val2;
        else obj[prop] = val1;
        return (val==val1)
            ? obj[prop] = val2
            : obj[prop] = val1;
    },

    togglepropWr: async function(rawargs) {
        const [sel, propchain, val1, val2] = cutils.tri.parseTerms(rawargs);
        const top_obj = $1(sel);
        const [obj, prop] = cutils.resolveComplexProperty(top_obj, propchain);
        // alert([sel, propchain, val1, val2, prop, obj[prop]]);
        return this.toggleprop(obj, prop, val1, val2||"");
    },

    /** Unhides elements matching SELECTOR. See get() for arguments and options */
    unhide: function(selector, opts={}) {
        const elts = cutils.get(selector, opts);
        elts.forEach(e=>e.className = e.className.replace("TridactylKilledElem", ""));
        return elts.length ? elts : null;
    },

    /** Unhides elements matching any of the SELECTORS. For more options, see rm() */
    unhideall: (...selectors) => cutils.unhide(selectors),

    urlopen: function(url, opts={}) {
        const urlstr = JSON.stringify(url);
        const optstr = JSON.stringify(opts);
        return tri.controller.acceptExCmd(`jsb utils.tab.open(${urlstr}, ${optstr})`);
    },

    yankby: (...args) => cutils.yank(cutils.getText(...args)),

    yank1by: function(selector, opts={}) {
        const text = this.getText1(selector, opts);
        return text!==null && cutils.yank(text);
    },

    yanknthby: function(selector, n=1, opts={}) {
        n = parseInt(n);
        const elts = cutils.get(selector, opts);
        const text = elts?.[n]?.innerText;
        return text!==null && cutils.yank(text);
    },

    yankelt: function(elts, opts={}) {
        /* options */
        opts = cutils.tri.parseOpts(opts, {castString: "textProperty"});
        opts.textProperty ??= "innerText";
        if (elts instanceof Node) elts = [elts];
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
        opts = cutils.tri.parseOpts(opts, {castBoolean: "cmdline"});
        opts.msg ??= true;
        opts.cmdline ??= true;
        /* yank */
        yank(s);
        /* message? */
        if (opts.msg) {
            opts.prefix ??= "Copied" + (opts.cmdline ? ": " : "...\n");
            cutils.message(s, opts);
        }
        return s;
    },

    SEL: {
        yankspan: [
            "span", "em", "strong", "u", "sub", "sup", "ruby",
            "a", "tr", "td", "cite", "data", "dd", "dt",
            "code", "pre", "output",
        ],
    },

    yankhint: async function(selectors, opts={}) {
        opts.switches ??= "-J";
        opts.property ||= "textContent";
        opts.trim ??= true;
        const callback = opts.trim
              ? `e => cutils.yank(e["${opts.property}"].trim())`
              : `e => cutils.yank(e["${opts.property}"])`;
        return tri.controller.acceptExCmd(
            `hint -c ${selectors} ${opts.switches} -F ${callback}`);
    },

    yankinput: async function(selectors="input", opts={switches:"-J"}) {
        selectors ||= "input"; opts.switches ||= "";
        return tri.controller.acceptExCmd(
            `hint -c ${selectors} ${opts.switches} -F e=>cutils.yank(e.value.trim())`);
    },

    yankjs: function(expr) { return this.yank(eval(expr)); },
    yankjsWr: function(args) { return this.yankjs(cutils.tri.parseArgs(args, "string")); },

    yankf: async function(fstr, ...rest) {
        const opts = typeof rest.at(-1) == "object"
              ? rest.pop()
              : {};
        const result = await this.sprintf(fstr, ...rest);
        return this.yank(result, opts);
    },

    // ╭────────────────╮
    // │ pure functions │
    // ╰────────────────╯

    asArr: x => cutils.isArrayConvertible(x) ? Array.from(x) : [x].flat(1),
    isIterable: x => typeof x?.[Symbol.iterator] == "function",
    isArraylike: x => Array.isArray(x) || (
        typeof x === "object"
            && typeof x.length == 'number'
            && (x.length-1 in x || x.length===0)
    ),
    isArrayConvertible: x => cutils.isIterable(x) || cutils.isArraylike(x),
    ownprops: function(x) { return Object.getOwnPropertyNames(x); },

    // ╭──────────────────────╮
    // │ conversion functions │
    // ╰──────────────────────╯

    hexToRGB: function(hex) {
        const re = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/;
        return hex.match(re).slice(1).map(n_hex=>parseInt(n_hex, 16));
    },
};

// ───────────────────────────────────────────────────────────────────────────────
// ╭─────────────────────────────╮
// │ cutils.css -- CSS utilities │
// ╰─────────────────────────────╯

cutils.css = {
    /* add rules to sheet STYLEID (see addRules()). If sheet doesn't exist, create it */
    add: async function(styleId, ...rules) {
        if (!$id(styleId)) {
            await this.addSheet(styleId);
        }
        return this.addRules(styleId, ...rules);
    },

    /* add rules to sheet STYLEID. Each rule is a pair [SELECTOR, DECLARATIONS] */
    /* DECLARATIONS is either a string or an object mapping properties to values */
    addRules: function(styleId, ...rules) {
        const sheet = document.getElementById(styleId).sheet;
        for (const rule of rules) {
            const [selector, decls] = rule;
            const declStr = (typeof decls == "string")
                  ? decls
                  : Object.keys(decls).map(k => `${k}: ${decls[k]}`).join("; ");
            sheet.insertRule(`${selector} { ${declStr} }`);
        }
        return sheet;
    },

    /* Create a new style with id STYLEID */
    addSheet: function(styleId) {
        const style = document.createElement("style");
        style.id = styleId;
        const sheet = document.head.appendChild(style).sheet;
        return sheet;
    },

    highlight: function(style={}, opts={}) {
        /* TODO: merge with existing _tri_hl span if overlapping */
        /*       split span if overlapping with other elements */
        const range = opts.range || document.getSelection().getRangeAt(0);
        const span = document.createElement("span");
        span.classList.add("_tri_hl");
        span.style.backgroundColor = "rgba(255,255,100,0.5)";
        for (const k in style) span.style[k] = style[k];
        range.surroundContents(span);
    },

    highlightString: async function(s, opts={}) {
        opts.context ||= document.body;
        opts.separateWordSearch ??= false;
        opts.acrossElements ??= true;
        opts.wildcards ??= true;
        opts.ignoreJoiners ??= true;
        await tri.controller.acceptExCmd(`js -r js/mark.es6.min.js`);
        this.addSheet("_tri_markjs");
        this.addRules("_tri_markjs", ["mark", "background-color: #80ff80"]);
        const markInst = new Mark(opts.context);
        if (opts.regex)
            return markInst.markRegExp(s, opts);
        else
            return markInst.mark(s, opts);
    },

    highlightStringOff: async function(opts={}) {
        opts.context ||= document.body;
        await tri.controller.acceptExCmd(`js -r js/mark.es6.min.js`);
        const markInst = new Mark(opts.context);
        return markInst.unmark(opts);
    },

    show: function(id) {
        alert(this.text(id));
    },

    text: function(id) {
        return [...document.getElementById(id).sheet.cssRules]
            .map(r=>r.cssText)
            .join("\n");
    },

    toggle: function(id) {
        const style = document.getElementById(id);
        return style.disabled ^= true;
    },

    toggleOrCreate: function(id, ...rules) {
        const style = document.getElementById(id);
        return style
            ? style.disabled ^= true
            : this.addSheet(id) && this.addRules(id, ...rules);
    },
};

// ───────────────────────────────────────────────────────────────────────────────
// ╭───────────────────────────────╮
// │ cutils.img -- image utilities │
// ╰───────────────────────────────╯

cutils.img = {

    hint: {
        cssTransform(transform) {
            transform = cutils.tri.parseArgs(transform, "str");
            tri.controller.acceptExCmd(`hint img -F e=>e.style.transform = "${transform}"`);
        },
    },

    mogrify: async function(ops) {
        /* ops = array of arguments to mogrify, eg. 'flip' (V reflect), 'flop' (H reflect), 'rotate DEG' ; */
        /*       or, a single argument string to be passed to mogrify, eg '-flip -rotate 30' */
        if (typeof ops === "string") {
            ops = ops.trim();
        } else {
            ops = ops.map(s=>s.trim()).filter(s=>s!="").map(s=>`-${s}`).join(" ");
        }
        var tempfile = (await tri.native.run("mktemp /tmp/mogrify.XXXXXX")).content.trim();
        await tri.native.run(`curl "${window.location.href}" > ${tempfile}`);
        await tri.native.run(`mogrify ${ops} '${tempfile}'`);
        tri.excmds.open(`file://${tempfile}`);
    },
},
// ───────────────────────────────────────────────────────────────────────────────
// ╭─────────────────────────────────────────────────╮
// │ cutils.mod -- utilities for modifying web pages │
// ╰─────────────────────────────────────────────────╯

cutils.mod = {
    /* Turn HEADING into a collapsible `details` element, containing CONTENT */
    makeCollapsible: async function(content, heading) {
        const det = document.createElement("details");
        const summ = document.createElement("summary");
        if (typeof heading == "string")
            content.before(det);
        else
            heading.before(det);
        det.appendChild(summ);
        summ.append(heading);
        det.appendChild(content);
    },

    /* Wrap element in a wrapper element */
    wrapin: function(e, wrapper) {
        const parent = e.parentNode;
        const next = e.nextSibling; /* may be nullish */
        wrapper.appendChild(e);
        parent.insertBefore(wrapper, next);
    },
};

// ───────────────────────────────────────────────────────────────────────────────
// ╭──────────────────────────────────────────────────────────────────╮
// │ cutils.tri -- utilities related to tridactyl source and features │
// ╰──────────────────────────────────────────────────────────────────╯

cutils.tri = {

    /** jsCmd(): run javascript command with arguments
     *    Special terms (substitutions):
     *      ARGS:    argument array
     *      ARG:     first argument (or null)
     *      ARGLEN:  number of arguments
     *      NUMARGS: array of numeric arguments
     *      NUMARG:  first numeric argument (or null)
     */
    jsCmd: async function(rawargs, opts={}) {
        const terms = cutils.tri.parseTerms(rawargs, opts);
        const [rawexpr, ...rawexprargs] = terms;
        const exprargs = JSON.stringify(rawexprargs);
        const firstarg = JSON.stringify(rawexprargs?.[0]);
        const N = JSON.stringify(rawexprargs.length);
        const numargs = JSON.stringify(rawexprargs.map(s=>Number(s)));
        const firstnumarg = JSON.stringify(Number(rawexprargs?.[0]));
        const expr =
              rawexpr.replace(/\bARGS\b/g, exprargs)
              .replace(/\bARG\b/g, firstarg)
              .replace(/\bARGLEN\b/g, N)
              .replace(/\bNUMARGS\b/g, numargs)
              .replace(/\bNUMARG\b/g, firstnumarg);
        return tri.excmds.js(expr);
    },

    jsCount: async function(rawargs, defaultCount=1) {
        const [args, rawcount] = cutils.tri.parseArgsAndCount(rawargs);
        const count = rawcount || defaultCount;
        const expr = args.join(" ").replace(/COUNT/g, count);
        return tri.excmds.js(expr);
    },

    /*    parseArgs(args, opts): return args as a string, an array of nonempty strings, or a number
     *  opts.type: desired result type
     *  opts.allowOpts: if true, treat the final arg as an opts object if possible; return [args, opts]
     */
    parseArgs: function(args, opts={}) {
        if (!Array.isArray(args)) args = [args];
        /* opts */
        opts = this.parseOpts(opts, {castString: "type"});
        var result = null, callerOpts = {};
        const finalArg = args.at(-1);
        if (opts.allowOpts && typeof finalArg == "object" && !Array.isArray(finalArg)) {
            [args, [callerOpts]] = tri.R.splitAt(-1, args);
        }
        /* args */
        const argstr = args.join(" ").trim();
        switch (opts.type) {
          case "string":
          case "str":
          case "s":
              result = argstr; break;
          case "number":
          case "num":
          case "n":
              result = Number(argstr) || null; break;
          case "array":
          case "arr":
          case "a":
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
        const hasCount = args[n].match(/^[1-9][0-9]*$/);
        const countElem = hasCount && args.pop();
        const count = countElem ? parseInt(countElem) : opts.defaultCount;
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
        } else if (options.castNode && rawopts instanceof Node) {
            opts[options.castNode] = rawopts;
        } else if (options.castRegExp && rawopts instanceof RegExp) {
            opts[options.castRegExp] = rawopts;
        } else if (options.castArray && Array.isArray(rawopts)) {
            opts[options.castArray] = rawopts;
        } else if (options.castArrayToBooleanOpts && Array.isArray(rawopts)) {
            opts = rawopts.reduce((acc,e)=>(acc[e]=true) && acc, {});
        } else {
            opts = rawopts;
        }
        /* defaults */
        options.defaults ||= {};
        options.nullishDefaults ||= {};
        for (const k of Object.keys(options.defaults)) {
            opts[k] ||= options.defaults[k];
        }
        for (const k of Object.keys(options.nullishDefaults)) {
            opts[k] ??= options.nullishDefaults[k];
        }
        /* return */
        return opts;
    },

    /* Parse raw arguments from tridactyl to return an array of string arguments.
     * Arguments are separated by spaces, but may be grouped using double quotes as
     * delimiters or slashes as separators (according to choice of opts.char).
     * Delimiting quotes must be preceded or followed by a space (or end of string),
     * otherwise the double quote is parsed as part of the argument.
     * Separating slashes must be surrounded by spaces.
     */
    parseTerms: function(args, opts={}) {
        const argstr = cutils.tri.parseArgs(args, "string");
        const words = argstr.split(/ +/);
        opts = cutils.tri.parseOpts(opts, {
            castString: "char",
            defaults: {"char": "\""}
        });
        var terms = [];
        switch(opts.char) {
          case "\"":
              for (let i=0; i<words.length; ++i) {
                  /* TODO: proper parsing with escapes (decide how to treat mid-word quotes) */
                  if (words[i].startsWith("\"") && words[i].endsWith("\"")) {
                      terms.push(words[i].slice(1, -1));
                  } else if (words[i].startsWith("\"")) {
                      const termwords = [];
                      if (words[i] !== "\"")
                          termwords.push(words[i].slice(1));
                      i++;
                      while (!words[i].endsWith("\"")) {
                          termwords.push(words[i]);
                          i++;
                      }
                      if (words[i] !== "\"")
                          termwords.push(words[i].slice(0, -1));
                      terms.push(termwords.join(" "));
                  } else {
                      terms.push(words[i]);
                  }
              }
              break;
          case "/":
              let termwords = [];
              for (let i=0; i<words.length; ++i) {
                  if (words[i]==="/") {
                      terms.push(termwords.join(" "));
                      termwords = [];
                  } else {
                      termwords.push(words[i]);
                  }
              }
              terms.push(termwords.join(" "));
              break;
        }
        return terms;
    },

    /* Parse raw arguments from tridactyl to return an array of string arguments and
     * optional final numeric count. Arguments are processed as in parseTerms()
     * If the last raw argument has the form of a positive integer, it is interpreted
     * as COUNT, unless surrounded by double quotes.
     */
    parseTermsAndCount: function(args, opts={}) {
        const argstr = cutils.tri.parseArgs(args, "string");
        const words = argstr.split(/ +/);
        const endsInQuote = argstr[argstr.length-1]=='"';
        var terms = cutils.tri.parseTerms(argstr);
        const n = terms.length - 1;
        const hasCount = terms[n].match(/^[1-9][0-9]*$/) && !endsInQuote;
        const countElem = hasCount && terms.pop();
        const count = countElem ? parseInt(countElem) : opts.defaultCount;
        return [terms, count];
    },

};

window.cutils = cutils;
window.R = R;

[
    "$$", "$1", "$$cls", "$1cls", "$id", "$$tag", "$1tag", "$$t", "$1t", "$$match",
    "click", "clickall", "click1", "scrollelt", "scrollNthIntoView",
    "get1", "getText", "getText1",
    "getSelectionDOM", "getSelectionHtml",
    "isolate", "jumpToHeading", "keep", "rm", "rmall", "setInput", "toggleprop", "togglepropWr",
    "urlopen",
    "SEL", "yankby", "yank1by", "yanknthby", "yankelt", "yankhint", "yankinput", "yankjs", "yankjsWr", "yankf",
    "datetime", "isInViewport", "isDisplayed", "sprintf",
    "asArr", "hexToRGB", "isArraylike", "isArrayConvertible", "isIterable", "ownprops",
    "saveText", "timestampFilename",
].forEach(k => window[k]=cutils[k]);

[
    "makeCollapsible", "wrapin",
].forEach(k => window[k]=cutils.mod[k]);

[
    "parseArgs", "parseArgsAndCount", "parseOpts", "parseTerms", "parseTermsAndCount",
].forEach(k => window[k]=cutils.tri[k]);

ownprops(Math).forEach(k => window[k] = Math[k]);

window.cutils = cutils;
