# notation
* `Ⓟ`: port from .pentadactylrc

# commands/bindings
* url/domain yanking **Ⓟ**
* tab removal **Ⓟ**
    - bdd binding
* regex highlight
* command for running JS with `await` by wrapping with `async function`, eg.\
  `jsbm (async ()=> (await tri.webext.activeTab()).url)()`
* quickmarks for jumping between buffers/web pages
* command for running excmds when commandline is broken
* command for toggling CSP
    - see:
        * https://github.com/yobukodori/csp-for-me/
        * https://github.com/sidanmor/csp-extension
        * `browser.webRequest.onHeadersReceived.addListener(tri.request.clobberCSP, ...)`
* sorttable.js is broken: fix table sorting

## command-line bindings
* binding (eg. <C-;>) to call rofi for completion
* marks improvement:
    * Allow marks to adapt to page alterations (exanding/contracting, removing elements)
        * allow hint-marking of element. You can then jump back to that element's location
        * track position using text content.
* collapse section: choose a heading via hints. Makes associated section collapsible (via `details` element)
    * If first child of a block element, affects the the parent element.
    * Otherwise, affects the following block element.
* color conversion rgb <-> hex
* cycle-by-selector: jump to next matching selector on page (or back to first if at end)

# sites
## youtube
* add marks command for marking times in video

# kwsearch
* implement "reverse search" (resolve URL into kw+query)
    * first filter by domain (?)
    * then, turn bmkw URLs to regex, replacing %s with `\(.*\)`
    * need to convert string->regex
        * for BRE, escape: `*.^$[]`
* search by tags
* add bookmarks

# javascript
* add userstyle support
    - inject style tag containing CSS into page
    - commands to turn on/off/toggle
    - autocommand to apply style
* add screenshot function for element (html2canvas lib?)
* add saveDataURI function

# bugs
* quoting issues for commands calling `kwsearch`. FIXED?

# new architecture
* documentation system

# investigate
* JS library offering prompts with a history?
* JS lib or native tool to prompt for input and dynamically adjust view according to input?
    - eg. the user enters a JS expression for filtering tabs and the list of tabs is updated
      to match the input.
