
const shell = {
    cmdRoxterm: async function(cmd, roxtermOpts=null) {
        roxtermOpts ??= "";
        if (!roxtermOpts.includes("--geometry")) roxtermOpts = `--geometry=80x40+182-90 ${roxtermOpts}`;
        const cmdq = shell.dblQEscape(cmd, 2);
        var fullcmd = `roxterm ${roxtermOpts} -e "bash -c \\"${cmdq}; bash\\""`;
        utils.msg(fullcmd);
        return tri.excmds.exclaim(fullcmd);
    },

    dblQEscape: function(s, levels=1) {
        for (i=0; i<levels; ++i) {
            s = s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        }
        return `${s}`;
    },

    singQEscape: function(s) { return s.replace(/'/g, "'\"'\"'"); },
};

window.shell = shell;
