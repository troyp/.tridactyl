window.utils = {

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

    tabRemove: async function(pred) {
        const tabs = await browser.tabs.query({pinned: false, currentWindow: true});
        const atab = await activeTab();
        const ids = tabs.filter(pred).map(tab => tab.id);
        return browser.tabs.remove(ids);
    },
    tabFilter: function(pred) {
        return tabRemove(!pred);
    },

}
