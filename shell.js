
const shell = {
    cmdRoxterm: async function(cmd, roxtermOpts=null) {
        roxtermOpts ??= "";
        if (!roxtermOpts.includes("--geometry")) roxtermOpts = `--geometry=80x40+182-90 ${roxtermOpts}`;
        const cmdq = shell.dblQEscape(cmd, 2);
        var fullcmd = `roxterm ${roxtermOpts} -e "bash -c \\"${cmdq}; bash\\""`;
        return tri.excmds.exclaim(fullcmd);
    },

    dblQEscape: function(s, levels=1) {
        for (i=0; i<levels; ++i) {
            s = s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        }
        return `${s}`;
    },

    singQEscape: function(s) { return s.replace(/'/g, "'\"'\"'"); },

    cmdOnURLFile: async function(cmd, url=tri.contentLocation.href) {
        if (typeof cmd != "string") cmd = utils.tri.parseArgs(cmd, "string");
        if (!cmd.includes("%f")) cmd += " %f";
        const localFileRegex = /^file:\/\/([^?#]*)/;
        const localFileMatch = url.match(localFileRegex);
        if (localFileMatch) {
            const localFile = decodeURIComponent(localFileMatch[1]).replace(/ /g, '\\ ');
            const localDir = localFile.replace(/[^/]+\/?$/, "");
            return tri.native.run(`cd ${localDir}; `+cmd.replace("%f", localFile));
        } else {
            return tri.native.run(`
                cd $(mktemp -d /tmp/TRI.XXXXXX);
                wget '${url}';
                f=$(echo *);
                /usr/bin/rename 's/\\.([a-zA-Z0-9]+)[?#][^.]*$/.\\1/' "$f";
                convert_webp "$f";
                ${cmd.replace("%f", "*")}
            `);
        }
    },
};

window.shell = shell;
