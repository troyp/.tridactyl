// ╭───────────────────────────────────────────────────────────╮
// │ cutils.js -- utility functions for content script context │
// ╰───────────────────────────────────────────────────────────╯

var cutils = {
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

    yankWithMsg: function(s, opts={}) {
        tri.excmds.yank(s);
        var defaultPrefix = "Copied" + (opts.useAlert ? "...\n" : ": ");
        opts.prefix = opts.prefix ?? defaultPrefix;
        this.message(s, opts);
    },
};

window.cutils = cutils;
