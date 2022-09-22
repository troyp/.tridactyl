;;; tri.el --- functions and macros for tridactyl config

;; Copyright (C) 2022 Troy Pracy

;; Author: Troy Pracy <troyp7@gmail.com>
;; Maintainer: Troy Pracy <troyp7@gmail.com>
;; Keywords: tridactyl
;; Version: 0.1.0
;; URL: https://github.com/troyp/.tridactyl/tree/main/emacs/tri.el

;; This program is free software; you can redistribute it and/or modify
;; it under the terms of the GNU General Public License as published by
;; the Free Software Foundation, either version 2 of the License, or
;; (at your option) any later version.

;; This program is distributed in the hope that it will be useful,
;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;; GNU General Public License for more details.

;; You should have received a copy of the GNU General Public License
;; along with this program.  If not, see <http://www.gnu.org/licenses/>.

;;; Commentary:

;;; Code:

;; ───────────────────────────────────────────────────────────────────────────────
;; ╭──────────────────╮
;; │  tridactyl-mode  │
;; ╰──────────────────╯

(defun my/tridactyl-init ()
  (interactive)
  (setq-local imenu-generic-expression `((nil "^\" [|│] .* [|│]$" 0)))
  (setq-local tab-width 4)
  )

(add-hook 'tridactyl-mode-hook 'my/tridactyl-init)

(spacemacs/set-leader-keys-for-major-mode 'tridactyl-mode
    ","     'my/dactyl-cycle-fill-prefix
    "'"     'my/tri-prefix-subheading-above
    "ca"    'my/tri-bind-with-above-desc-to-bind:
    "cb"    'my/tri-bind:-to-bdoc
    "cB"    'my/tri-bdoc-to-bind:
    "cc"    'my/tri-command:-to-commdoc
    "cC"    'my/tri-commdoc-to-command:
    "cf"    'my/js-fn-to-method
    "cm"    'my/tri-map-to-bind
    "ct"    'my/tri-js-openorselect-to-tabopenorswitch
    "c'"    'my/tri-comment-to-inline-description
    "c-"    'my/tri-js-d-to-js-p
    "c_"    'my/tri-js-p-to-js-d
    "c\\"   'my/tri-bar-subheading-to-unibox
    "gb"    'my/tri-goto-binding
    "gc"    'my/tri-goto-command
    "gh"    'my/tri-goto-heading
    "dc"    'my/tri-add-commdoc-above
    "o '"   'my/tri-show-quote-sections
    "p"     'my/tri-visit-pentadactylrc
    "t"     'dactyl-text-mode
    "SPC"   'helm-imenu
    )

(which-key-add-major-mode-key-based-replacements 'tridactyl-mode
    ", c"       "convert"
    ", d"       "documentation"
    ", g"       "goto"
    ", o"       "occur"
    )

;; ───────────────────────────────────────────────────────────────────────────────
;; ╭─────────────────╮
;; │ my/tri-goto-... │
;; ╰─────────────────╯

(defun my/tri-goto-command (cmd)
  "Jump to specified command"
  (interactive
   (list
    (let* ((cmd-at-pt (or (thing-at-point 'symbol) ""))
           (cmd-at-pt-re (format "%s\\_>" cmd-at-pt))
           (msg       (format "Command [default %s]: " cmd-at-pt))
           (input     (s-trim (read-string msg nil nil cmd-at-pt-re)))
           (cmd       (replace-regexp-in-string "\\_<:" "" input)))
      cmd)))
  (unless (string-empty-p cmd)
    (let ((start-pos (point)))
      (beginning-of-buffer)
      (if (re-search-forward (concat "^command:? " cmd) nil t)
          (progn (recenter 4) (beginning-of-line))
        (goto-char start-pos)))))

(defun my/tri-goto-binding (b)
  "Jump to specified binding"
  (interactive "sKeys: ")
  (unless (string-empty-p b)
    (let ((start-pos (point)))
      (beginning-of-buffer)
      (if (let ((case-fold-search nil))
            (re-search-forward (concat "^a?bind:? +\\(--mode=\\(normal\\|browser\\) +\\)?<?" b ">?") nil t))
          (progn (recenter 4) (beginning-of-line))
        (goto-char start-pos)))))

(defun my/tri-goto-heading (h)
  "Jump to specified boxed heading"
  (interactive "sHeading: ")
  (let ((start-pos (point)))
    (unless (string-empty-p h) (beginning-of-buffer))
    (if (re-search-forward (pcre-to-elisp (concat "^ *\" *[|│] +(.*-- )?" h ".* [|│]") "i") nil t)
        (progn
          (recenter 4)
          (beginning-of-line))
      (goto-char start-pos))))

;; ╭───────────────╮
;; │ my/tri-occur- │
;; ╰───────────────╯

(defun my/tri-show-quote-sections ()
  "Open an `occur' buffer with all section headings."
  (interactive)
  (occur (pcre-to-elisp "^ *\" *[|│] .* [|│] *\"?$"))
  (switch-to-buffer-other-window "*Occur*"))


;; ╭────────────────────────╮
;; │ documentation commands │
;; ╰────────────────────────╯

(defun my/get-surrounding-lines (beg-regex end-regex &optional pos)
  "Return a pair (BEG . END) marking the range of lines from the first line before POS matching BEG-REGEX to
the first line after POS matching END-REGEX"
  (let (beg end)
    (save-excursion
      (when pos (goto-char pos))
      (end-of-line)
      (re-search-backward beg-regex)
      (setq beg (line-beginning-position))
      (re-search-forward end-regex)
      (setq end (line-end-position))
      (cons beg end))))

(defun my/select-surrounding-lines (beg-regex end-regex &optional pos)
  "Select a region of lines from the first line before POS matching BEG-REGEX to the first line after POS
 matching END-REGEX"
  (let ((range (my/get-surrounding-lines beg-regex end-regex pos)))
    (set-mark (car range))
    (goto-char (cdr range))
    (activate-mark)))

(my/kmacro-fset 'my/tri-comment-to-inline-description
  "Convert a comment above a bind/command/etc definition to an inline description in a bindd/etc definition"
  [1 119 118 36 104 121 106 1 101 97 100 escape 87 87 105 34 34 32 escape
     104 80 escape 107 100 100 106 1])

(my/kmacro-fset 'my/tri-bind-with-above-desc-to-bind:
  "Convert a bind statement with commented description above to a bind: statement with inline description"
  [107 48 108 108 118 36 104 121 106 48 69 97 58 escape 87 69 97 32 34 34 escape 80 107 100 100])

(defun my/tri-bind:-to-bdoc ()
  "Convert a bind: command to a bind command with a bdoc command above"
  (interactive)
  (my/evil-substitute-region
   "(.*)bind: +([^ ]+) +\"([^\"]+)\" +(.*)"
   "\\1bdoc \\2 \"\\3\"\n\\1bind \\2 \\4"))

(defun my/tri-bdoc-to-bind: ()
  "Convert a bind command with a bdoc command above to a bind: command"
  (interactive)
  (my/select-surrounding-lines "bdoc" "bind")
  (my/evil-substitute-region
   "(.*)bdoc +([^ ]+) +\"(.*)\"\\n(.*)bind +([^ ]+) +(.*)"
   "\\1bind: \\2 \"\\3\" \\6"))

(defun my/tri-command:-to-commdoc ()
  "Convert a command: command to a command command with a commdoc command above"
  (interactive)
  (my/evil-substitute-region "command: +([^ ]+) +\"([^\"]+)\" +(.*)" "commdoc \\1 \"\\2\"\ncommand \\1 \\3"))

(defun my/tri-commdoc-to-command: ()
  "Convert a command command with a commdoc command above to a command: command"
  (interactive)
  (my/select-surrounding-lines "commdoc" "command")
  (my/evil-substitute-region "commdoc +([^ ]+) +\"(.*)\"\\ncommand +([^ ]+) +(.*)" "command: \\1 \"\\2\" \\4"))

(my/kmacro-fset 'my/tri-add-commdoc-above
  "Add a `commdoc` statement above a command definition"
  [94 87 121 105 87 79 99 111 109 109 100 111 99 32 escape 112 97 32 34 34 2])

(my/kmacro-fset 'my/tri-prefix-subheading-above
  "Add a subheading for a keybinding prefix above the current line"
  "0WvEhyO\" | p --  |")

(my/kmacro-fset 'my/tri-bar-subheading-to-unibox
  "Convert a | bar heading | into a unicode box heading"
  [48 52 108 118 36 104 104 104 121 99 99 escape 32 111 97 59 117 25 134217849 return])

;; ╭──────────────────────╮
;; │ refactoring commands │
;; ╰──────────────────────╯

(defun my/tri-js-d-to-js-p ()
  (interactive)
  (my/evil-substitute-region "js(b?) -d¦ (.*)JS_ARGS\\[1\\](.*)¦" "js\\1 -p \\2JS_ARG\\3"))

(defun my/tri-js-p-to-js-d ()
  (interactive)
  (my/evil-substitute-region "js(b?) -p (.*)JS_ARG(.*)" "js\\1 -d¦ \\2JS_ARGS[1]\\3¦"))

;; ╭────────────────────────────────╮
;; │ penta->tri conversion commands │
;; ╰────────────────────────────────╯

(my/kmacro-fset 'my/tri-map-to-bind
  "Convert .pentadactylrc definition using map to tridactylrc one with bind"
  [58 115 47 106 115 32 111 112 101 110 79 114 83 101 108 101 99 116 84 97 98 40 91
      39 34 93 92 40 46 42 92 41 91 39 34 93 41 59 63 47 116 97 98 111 112 101 110 111
      114 115 119 105 116 99 104 99 32 92 49 47 return])

(my/kmacro-fset 'my/tri-js-openorselect-to-tabopenorswitch
  "Convert .pentadactylrc definition using openOrSelect() to tridactylrc one with tabopenorswitch"
  [58 115 47 106 115 32 111 112 101 110 79 114 83 101 108 101 99 116 84 97 98 40 91
      39 34 93 92 40 46 42 92 41 91 39 34 93 41 59 63 47 116 97 98 111 112 101 110 111
      114 115 119 105 116 99 104 99 32 92 49 47 return])

;; ╭────────────────────────╮
;; │ miscellaneous commands │
;; ╰────────────────────────╯

(defun my/tri-visit-pentadactylrc ()
  (interactive)
  (find-file "~/.pentadactylrc"))

;; ───────────────────────────────────────────────────────────────────────────────
(provide 'tri)
