// ───────────────────────────────────────────────────────────────────────────────
// ╭────────────╮
// │            │
// │  HINTS.js  │
// │            │
// ╰────────────╯

const hints = {

    follow: async function(opts={}) {
        opts = utils.tri.parseOpts(opts, {castArray: "extraSelectors", castString: "switches", });
        const switches = opts.switches || "";
        const selectors = tri.config.get("hinttags.default").concat(opts.extraSelectors);
        hint(switches, "-c", selectors.join(","));
    },

};

tri.config.set(
    "hinttags.default", [
        "input:not([type=hidden]):not([disabled])",
        "a",
        "area",
        "button",
        "details",
        "iframe",
        "label",
        "select",
        "summary",
        "textarea",
        "label",
        "th",
        "[onclick]",
        "[onmouseover]",
        "[onmousedown]",
        "[onmouseup]",
        "[oncommand]",
        "[role='link']",
        "[role='button']",
        "[role='checkbox']",
        "[role='combobox']",
        "[role='listbox']",
        "[role='listitem']",
        "[role='menuitem']",
        "[role='menuitemcheckbox']",
        "[role='menuitemradio']",
        "[role='option']",
        "[role='radio']",
        "[role='scrollbar']",
        "[role='slider']",
        "[role='spinbutton']",
        "[role='tab']",
        "[role='textbox']",
        "[role='treeitem']",
        "[class*='button']",
        "[tabindex]",
    ],
);

window.hints = hints;
