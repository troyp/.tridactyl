# commandline
* not shown on SVG file

# bindings
* super key (keydown) cancels nmode

# searchurls
* slow - can't add many without crashing/freezing
* searchurls without %s add search term at end *after a space* (can break search, eg cnrtl.
* No URL encoding of search term: break when search term contains "&", "#", etc

# hoverlinks
* links in completions don't need hoverlinks
* arguably: any links whose text == href don't need them
* hoverlinks should not be positioned over commandline (or completions)

# js(b) -d
* || doesn't work inside `js -d`
* allow paired delimiters
    - if `js -d` contains another `js -d` (eg. if you're defining a custom definition command), you have to ensure
      the embedded commands use a different delimiter.
    - options:
        - unicode paired brackets: https://stackoverflow.com/questions/13535172/list-of-all-unicodes-open-close-brackets
        - special syntax to allow multilevel delimitation, eg. `js -d<¦ ... ¦`

# tabs
* `:tabsort` takes multiple passes to sort tabs

# architecture
* for most commands, you can't access additional options using tridactyl API - methods just correspond to functions
  directly
* counts implementation hacky
    * any binding with count needs a corresponding command - can't access `count` var from JS
    * using count with : won't pass count to command typed (count is placed at start of line instead of end)
