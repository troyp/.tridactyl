## multi-search:

| options                   | ma,map,cq | arg-syntax    | original methods            | usage notes            |
|:--------------------------|:----------|:--------------|:----------------------------|:-----------------------|
| `queryFirst`              | `e,2,n`   | `Q E...`      | `multiengine({queryFirst})` | used with Q pre-filled |
| `queryLast`               | `e,1,n`   | `E... Q`      | `multiengine()`             | used interactively     |
| `engineFirst`             | `q,2,n`   | `E Q...`      | `multi()`                   | used interactively     |
| `engineFirst+singleQuery` | `q,2,y`   | `E Q---`      | `multi({singleQuery?})`     | used with E pre-filled |
| `engineLast`              | `q,1,n`   | `Q... E`      |                             | not provided           |
| `engineLast+singleQuery`  | `q,1,y`   | `Q--- E`      |                             | not provided           |
|                           |           |               |                             |                        |
| `polysearch`              |           | `Q... / E...` |                             | used interactively     |
