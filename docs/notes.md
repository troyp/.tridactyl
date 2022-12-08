## unified multi-search:
_not implemented_

| options                   | ma,map,cq | arg-syntax    | original methods            | usage notes            |
|:--------------------------|:----------|:--------------|:----------------------------|:-----------------------|
| `queryFirst`              | `e,2,n`   | `Q E...`      | `multiengine({queryFirst})` | used with Q pre-filled |
| `queryLast`               | `e,1,n`   | `E... Q`      | `multiengine()`             | used interactively     |
| `engineFirst`             | `q,2,n`   | `E Q...`      | `multi()`                   | used interactively     |
| `engineFirst+singleQuery` | `q,2,y`   | `E Q---`      | `multi({singleQuery?})`     | used with E pre-filled |
| `engineLast`              | `q,1,n`   | `Q... E`      |                             | NOT PROVIDED           |
| `engineLast+singleQuery`  | `q,1,y`   | `Q--- E`      |                             | NOT PROVIDED           |
|                           |           |               |                             |                        |

##### special

| options                   | ma,map,cq | arg-syntax    | original methods            | usage notes            |
|:--------------------------|:----------|:--------------|:----------------------------|:-----------------------|
| `polysearch`              |           | `Q... / E...` |                             | used interactively     |

__ma__: multi-argument component (e=engine, q=query)
__map__: multi-argument position (1=start, 2=end)
__cq__: complex query - multiple query arguments concatenated into multiword query (y/n)

### simplified engine and query options
* engines cannot contain spaces or quotes: single-engine and multi-engine cases can be unified by allowing
  a quoted sequence of engines wherever a single engine is allowed.
* __ma__ = q only
* complex queries can be quoted

| options                   | ma,map,cq | arg-syntax    | original methods            | usage notes            |
|:--------------------------|:----------|:--------------|:----------------------------|:-----------------------|
| `engineFirst`             | `q,2,n`   | `E Q...`      | `multi()`                   | used interactively     |
| `engineFirst+singleQuery` | `q,2,y`   | `E Q---`      | `multi({singleQuery?})`     | used with E pre-filled |
| `engineLast`              | `q,1,n`   | `Q... E`      |                             | NOT PROVIDED           |
| `engineLast+singleQuery`  | `q,1,y`   | `Q--- E`      |                             | NOT PROVIDED           |
|                           |           |               |                             |                        |

##### special

| options                   | ma,map,cq | arg-syntax    | original methods            | usage notes            |
|:--------------------------|:----------|:--------------|:----------------------------|:-----------------------|
| `queryFirst`              | `e,2,n`   | `Q E...`      | `multiengine({queryFirst})` | FOR CONVENIENCE <br> used with Q pre-filled |

## disable message for next yank command
_not implemented_

* setting `_yank_disable_next_message`
* keybinding for disable-yank-msg sets this setting to current datetime
* yank commands refactored to use `[c]utils.tri.yankMsg()` function rather than `[c]utils.message()`
* `yankMsg()`:
    * checks value of `_yank_disable_next_message`: if datetime-value is in (0, threshold), suppress message
    * clear value of `_yank_disable_next_message`

### disable message for all yank commands

* Allow `_yank_disable_next_message` to be set to `true`
* disable-yank-msg binding doesn't set if value is `true`
* `yankMsg()` checks for `true`: if so, suppresses message but doesn't clear value
