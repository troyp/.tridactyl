# ╭──────────╮
# │          │
# │  TRI.SH  │
# │          │
# ╰──────────╯

unalias tri

tri () {
    # ╭───────────╮
    # │ variables │
    # ╰───────────╯
    local dir="";
    local files="";
    local re="";
    local page="";
    local tree="";

    TRI_CONFIG_DIR=${TRI_CONFIG_DIR:-$HOME/.config/tridactyl};
    TRI_SRC_DIR=${TRI_SRC_DIR:-$TRI_REPO_DIR/src};
    TRI_NATIVE_SRC_DIR=${TRI_NATIVE_SRC_DIR:-$TRI_NATIVE_REPO_DIR/src};
    local TRI_DIR_RE="$TRI_CONFIG_DIR|$TRI_SRC_DIR|$TRI_NATIVE_SRC_DIR";

    # ╭─────────╮
    # │ options │
    # ╰─────────╯
    SHORT=c,h,f,n,p,r:,s,t
    LONG=config-dir,help,files,native,pager,regex:,source-dir,tree
    PARSED=$(getopt -a -n tri --options $SHORT --longoptions $LONG -- "$@")

    eval set -- "$PARSED"

    while :
    do
        case "$1" in
            (-h | --help)
                cat <<'ENDHELP'
USAGE: tri [OPTION...]
    Access tridactyl user configuration directory and source directory.
    Uses environment variables $TRI_CONFIG_DIR and $TRI_SRC_DIR (or
    $TRI_REPO_DIR/src).

Options:
  -c     --config-dir       change to config directory
  -h     --help             show help
  -f     --files            show matching files only
  -n     --native           change to native messenger source directory
  -p     --pager            show output in pager
  -r RE  --regex RE         search for lines (or files with -f) matching the regex RE
  -s     --source-dir       change to source directory
  -t     --tree             view directory tree (current directory when under $TRI_CONFIG_DIR
                            or $TRI_SRC_DIR, or $TRI_SRC_DIR if run from elsewhere).
ENDHELP
                return; ;;
            (-c | --config-dir)     cd $TRI_CONFIG_DIR; return; ;;
            (-f | --files)          files=t; shift; ;;
            (-n | --native)         cd $TRI_NATIVE_SRC_DIR; return; ;;
            (-p | --pager)          page=t; shift; ;;
            (-r | --regex)          re="$2"; shift 2; ;;
            (-s | --source-dir)     cd $TRI_SRC_DIR; return; ;;
            (-t | --tree)           tree=t; shift; ;;
            (--)                    shift; break ;;
            (*) echo "unrecognized option: $1" >&2 ; return 1; ;;
        esac
    done

    # ╭────────────╮
    # │ main logic │
    # ╰────────────╯
    # if [[ $re =~ \$ ]]; then re="${re%$}(\.ts)?$"; fi;

    if [[ -z $dir ]]; then
        if [[ $PWD =~ $TRI_DIR_RE ]]; then
            dir=$PWD;
        else
            dir=$TRI_SRC_DIR;
        fi;
    fi;

    {
        if [[ -n $tree ]]; then
            \tree -af -I .git "$dir";
        elif [[ -n $files ]]; then
            \rgrep -ilP --exclude-dir '.git' "$re" "$dir";
        elif [[ -n $re ]]; then
            \rgrep -inP --exclude-dir '.git' "$re" "$dir";
        else { echo else; return 0; }
        fi
    } | {
        sed "s|$dir/||"
    } | {
        if [[ -n $tree && -n $re ]]; then
            \grep -iP --color=always "(.*$re.*|)";
        else
            \grep -iP --color=always "$re";
        fi
    } | {
        if [[ -n $page ]]; then
            \less -R;
        else cat;
        fi;
    }
}
