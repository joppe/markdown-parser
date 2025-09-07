# A Markdown parser

[Introduction](https://daringfireball.net/projects/markdown/syntax)
[Spec](https://spec.commonmark.org/0.31.2/)

## Structure

```
character
line := character(0..x)
line_ending := \n
blank_line := ' '(0..x) + \n

tab stop = 4 spaces

backslash escapes

puncuation character := !"#$%&'()\*+,-./:;<=>?@[\]^\_`{|}~

preceded white space := ' '(0..3)  -> pws

document := block(0..x)

block := container | leaf

leaf := break | heading

break := pws[-\_\*](3..x).(0..x)

heading := pws#(1..6=n)' '.(1..x)(' '#(0..x)' '(0..x))?

setext heading := line + line_ending + ' '(0..3)[-=](1..x)' '(0..x)

indented code block := ' '(4..x).(1..x)

code fence := pws[`~=char](3..x=count)<info string>\n.(0..x)[char](count..x)' '(0..x)

html block := tag

link reference := pws\[text\]:' '(0..x)<link>' '(0..x)"<link defintion>"

paragraph := .*

container := quote | list_item

quote := pws>' '

list_item := [-+*]


inlines

code_span := `<text>`
```

- blocks
  - quote
    - blocks
  - list
    - blocks
  - heading
    - inlines
  - rule
  - code
  - paragraph
    - inlines
- inlines
  - text
  - link
  - emphasize
  - image
  - span

Indicators of block structure always take precedence over indicators of inline structure.
