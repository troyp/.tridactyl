;;; tridactyl-mode.el --- Major mode for tridactyl configuration file -*- lexical-binding: t -*-

;; Copyright (C) 2018 Matúš Goljer

;; Author: Matúš Goljer <matus.goljer@gmail.com>
;;         Troy Pracy <troyp7@gmail.com>
;; Maintainer: Matúš Goljer <matus.goljer@gmail.com>
;; Version: 0.0.1
;; Created: 22nd September 2018
;; Package-requires: ((dash "2.14.0"))
;; Keywords: languages

;; This program is free software; you can redistribute it and/or
;; modify it under the terms of the GNU General Public License
;; as published by the Free Software Foundation; either version 3
;; of the License, or (at your option) any later version.

;; This program is distributed in the hope that it will be useful,
;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;; GNU General Public License for more details.

;; You should have received a copy of the GNU General Public License
;; along with this program. If not, see <http://www.gnu.org/licenses/>.

;;; Commentary:

;; Major mode for editing tridactyl configuration, an extension for
;; Firefox web browser.  See https://github.com/tridactyl/tridactyl

;;; Code:

(require 'conf-mode)

(defconst tridactyl-syntax-propertize-function
  (syntax-propertize-rules
   ("^\\\"" (0 "<"))))

(setq tridactyl-keywords
      '("autocmd_logger"
        "apropos"
        "autocmd"
        "autocmddelete"
        "autocontain"
        "back"
        "bind"
        "bindurl"
        "blacklistadd"
        "bmark"
        "bmarks"
        "changelistjump"
        "clearsearchhighlight"
        "clipboard"
        "colourscheme"
        "comclear"
        "command"
        "composite"
        "containerclose"
        "containercreate"
        "containerdelete"
        "containerupdate"
        "credits"
        "drawingerasertoggle"
        "drawingstart"
        "echo"
        "editor"
        "elementunhide"
        "escapehatch"
        "exclaim"
        "exclaim_quiet"
        "extoptions"
        "fillcmdline"
        "fillcmdline_nofocus"
        "fillcmdline_notrail"
        "fillcmdline_tmp"
        "fillinput"
        "find"
        "findnext"
        "firefoxsyncpull"
        "firefoxsyncpush"
        "fixamo"
        "fixamo_quiet"
        "focusinput"
        "followpage"
        "forward"
        "fullscreen"
        "get"
        "getclip"
        "gobble"
        "guiset"
        "guiset_quiet"
        "help"
        "hint"
        "home"
        "issue"
        "js"
        "jsb"
        "jsonview"
        "jumble"
        "jumpnext"
        "jumpprev"
        "keyfeed"
        "keymap"
        "mktridactylrc"
        "mode"
        "mouse_mode"
        "mute"
        "native"
        "nativeinstall"
        "nativeopen"
        "neo_mouse_mode"
        "nmode"
        "no_mouse_mode"
        "open"
        "open_quiet"
        "parseWinTabIndex"
        "perfdump"
        "perfhistogram"
        "pied_piper_mouse_mode"
        "pin"
        "qall"
        "quickmark"
        "reader"
        "recontain"
        "reload"
        "reloadall"
        "reloadallbut"
        "reloaddead"
        "reloadhard"
        "removepref"
        "repeat"
        "reset"
        "reseturl"
        "restart"
        "rot13"
        "rssexec"
        "run_exstr"
        "sanitise"
        "saveas"
        "scrollline"
        "scrollpage"
        "scrollpx"
        "scrollto"
        "set"
        "setmode"
        "setnull"
        "setpref"
        "seturl"
        "shellescape"
        "sleep"
        "snow_mouse_mode"
        "source"
        "source_quiet"
        "tab"
        "tab_helper"
        "taball"
        "tabaudio"
        "tabclose"
        "tabcloseallto"
        "tabdetach"
        "tabduplicate"
        "tabgrab"
        "tabmove"
        "tabnext"
        "tabnext_gt"
        "tabonly"
        "tabopen"
        "tabprev"
        "tabpush"
        "tabqueue"
        "tabrename"
        "tabsort"
        "tssReadFromCss"
        "ttscontrol"
        "ttsread"
        "ttsvoices"
        "tutor"
        "unbind"
        "unbindurl"
        "undo"
        "unfocus"
        "unset"
        "unsetmode"
        "unseturl"
        "updatecheck"
        "updatenative"
        "url2args"
        "urlincrement"
        "urlmodify"
        "urlmodify_js"
        "urlparent"
        "urlroot"
        "version"
        "viewconfig"
        "viewcontainers"
        "viewsource"
        "winclose"
        "winmerge"
        "winopen"
        "yank"
        "yankimage"
        "zoom"
        ;; user-defined
        "bindurl:"
        "command:"
        "commdoc"
        "docbindmode"
        "docdef"
        "set:"
        "urlmodorsummon_g"
        (: (0+ alnum) "bind" (opt ":"))
        (: (0+ alnum) "bdoc")
        ))

;;;###autoload
(define-derived-mode tridactyl-mode conf-space-mode "Tridactyl"
  "Major mode for editing tridactylrc file."
  (conf-mode-initialize "\"")
  (modify-syntax-entry ?\; ".")
  (set (make-local-variable 'conf-space-keywords)
       (rx (eval `(or ,@tridactyl-keywords))))
  (set (make-local-variable 'parse-sexp-lookup-properties) t)
  (set (make-local-variable 'syntax-propertize-function)
       tridactyl-syntax-propertize-function))

;;;###autoload
(add-to-list 'auto-mode-alist '("tridactylrc\\'" . tridactyl-mode))

(provide 'tridactyl-mode)
;;; tridactyl-mode.el ends here
