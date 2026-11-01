# A Markdown parser

- [Introduction](https://daringfireball.net/projects/markdown/syntax)
- [Spec](https://spec.commonmark.org/0.31.2/)

## Preliminaries

- **character**: a Unicode character
- **line**: `character(0..x)[EOL EOL]`
- **blank line**: `WS(0..x)EOL`

## Tabs

Tabs in lines not expanded to spaces.
