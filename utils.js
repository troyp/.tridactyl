var utils = {

    convertUnits: function(args) {
        args = args.filter(a=> a.trim()!== "");
        var n, unit1, unit2;
        if (args.length==1) {
            return tri.native.run(`units -t ${args[0]}`).then(
                res => res.content
            );
        } else {
            if (args.length==2) {
                var match = String(args[0]).match(/([0-9.*/+-]*)(.*)/);
                n = match[1]||"1";
                unit1 = match[2];
                unit2 = args[1];
            } else {
                [n, unit1, unit2] = args;
            }
            return tri.native.run(`units -t "${eval(n)} ${unit1}" ${unit2}`).then(
                res => {
                    if (res.code==0) return n + unit1 + " = " + res.content + unit2;
                    else return `ERROR code ${res.code}:${res.content}\n\tcommand: ${res.command}`;
                }
            );
        }
    },

    message: function(s, opts={}) {
        var s_ = (opts.prefix || "") + s;
        if (opts.temp) {
            let t = opts.duration || 3000;
            tri.excmds.fillcmdline_tmp(s_, t);
        } else {
            tri.excmds.fillcmdline_nofocus(s_);
        }
        return s;
    },

    sunriseSunset: function(lat, long) {
        var times = SunCalc.getTimes(new Date(), lat, long);
        return [sunrise, sunset] = [times.sunrise, times.sunset].map(t=>t.toTimeString());
    },

    tab: {

        getAll: async function(opts={}) {
            if (! ("currentWindow" in opts)) opts.currentWindow = true;
            return ( await browser.tabs.query(opts) );
        },

        getNumber: async function(opts={}) {
            return this.getAll(opts).then(tt => tt.length);
        },

        remove: async function(pred) {
            const tabs = await browser.tabs.query({pinned: false, currentWindow: true});
            const atab = await activeTab();
            const ids = tabs.filter(pred).map(tab => tab.id);
            return browser.tabs.remove(ids);
        },
        filter: function(pred) {
            return tabRemove(!pred);
        },

        select: async function(index) {
            if (index=="$") index = 0; else index = Number(index);
            var n = await this.getNumber();
            var i = (index-1).mod(n) + 1;
            browser.tabs.query({currentWindow: true, index: i-1}).then(
                tt=> browser.tabs.update(tt[0].id, { active: true })
            );
        },

    },

    yankWithMsg: function(s, opts={}) {
        tri.excmds.yank(s);
        if (!("prefix" in opts)) opts.prefix = "Copied: ";
        this.message(s, opts);
    },

}

window.utils = utils;
