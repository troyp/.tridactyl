#! /usr/bin/env python3
# ╭──────────╮
# │          │
# │  tridoc  │
# │          │
# ╰──────────╯
import sys, os, subprocess, itertools
from getopt import getopt, GetoptError

def group(iterable, n):
    return itertools.zip_longest(*[iter(iterable)*n])

def not_ignored(f):
    res = subprocess.run(["git", "check-ignore", f])
    if res.returncode==0:
        return False
    elif res.returncode==1:
        return True
    else:
        raise subprocess.CalledProcessError(res.returncode, "git check-ignore")

class Binding:
    def __init__(self, keyseq, cmd, desc=""):
        self.keyseq = keyseq
        self.cmd = cmd
        self.desc = desc
    def __str__(self):
        desc = f" «{self.desc}»" if self.desc else ""
        return f"{self.keyseq:<8}   «{self.desc}»  {self.cmd}"

def main():
    # ╭─────────╮
    # │ options │
    # ╰─────────╯
    import getopt
    optmap = {
        "h" : "help",
        "b" : "bindings",
        "c" : "commands",
        "p" : "prefixes",
        "s" : "sections"
    }
    optmap_r = { optmap[c] : c for c in optmap }
    shortopts = "".join(optmap)
    longopts = [optmap[c] for c in shortopts]
    try:
        opts, args = getopt(sys.argv[1:], shortopts, longopts)
    except GetoptError as err:
        print(err, file=sys.stderr)
        sys.exit(2)
    # opts is a list of [(opt, val)...] pairs
    for optpr in opts:
        if optpr[0] in shortopts
        optpr[0] = optmap[opts[i]]
    optkeys, optvals = zip(*opts)

    # ╭──────╮
    # │ help │
    # ╰──────╯
    if "help" in optkeys:
        print("""
USAGE: tridoc [OPTION...]
    Access tridactyl config documentation

Options:
  -h  --help               show help
  -b  --bindings           show bindings
  -c  --commands           show commands
  -p  --prefix-headings    show prefix headings
  -s  --sections           show sections
    """.strip())

    # ╭─────────────╮
    # │ environment │
    # ╰─────────────╯
    tridir = os.environ["TRI_CONFIG_DIR"]
    os.chdir(tridir)
    allfiles = os.listdir(tridir)
    files = filter(not_ignored, allfiles)

    # ╭────────────╮
    # │ main logic │
    # ╰────────────╯

    # TODO: finish
