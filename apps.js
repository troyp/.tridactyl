// ╭────────────────────────────────────────────╮
// │ apps.js -- Application code for .tridactyl │
// ╰────────────────────────────────────────────╯

var apps = {

    convertUnits: function(args) {
        args = args.filter(a=> a.trim()!== "");
        var n=1, unit1="", unit2="";
        if (args.length==1) {
            return tri.native.run(`units -t ${args[0]}`).then(
                res => res.content
            );
        } else {
            if (args.length==2) {
                var match = String(args[0]).match(/([0-9.*/+-]*)(.*)/);
                n = match[1]||"1";
                if (match[2]) {
                    unit1 = match[2];
                    unit2 = args[1];
                } else {
                    unit1 = args[1];
                }
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

    kwsearch: async function(args, opts={where: "last"}) {
        const [kw, ...rest] = utils.tri.parseArgs(args);
        return tri.native.run(`kwsearch -K ${kw} ${rest.join(" ")||"''"}`).then(
            res => utils.tab.open(res.content, opts));
    },

    sunriseSunset: function(lat, long) {
        const times = SunCalc.getTimes(new Date(), lat, long);
        return [sunrise, sunset] = [times.sunrise, times.sunset].map(t=>t.toTimeString());
    },

}

window.apps = apps;
