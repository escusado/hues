#HUES prototype

A twitter robot that can drive Phillpis HUES.

## How

The twitter client grabs all the mentions to it, saves them and queue them

A second program, parses them and organizes them so they won't be processed twice.

This particular implementation process the `#room` command and a `#color` parameter.