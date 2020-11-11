# volto-slate
[![Releases](https://img.shields.io/github/v/release/eea/volto-slate)](https://github.com/eea/volto-slate/releases)
[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-slate%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-slate/job/master/display/redirect)
[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-slate%2Fdevelop&subject=develop)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-slate/job/develop/display/redirect)

An alternative text editor for Volto, capable of completely replacing the default richtext editor while offering enhanced functionality and behavior. We believe that, in order to succeed, Volto's richtext form editor (the Volto Composite Page editor) needs strong integration between the rich text capabilities and the rest of the Volto blocks. Some examples of the kind of strong integration we have in mind:

- Pasting complex documents inside a volto-slate text block will create multiple Volto blocks: images will be converted to Volto Image blocks, tables will be converted to Volto Table blocks, etc.
- The text block accepts drag&drop images and it will upload them as Volto Image blocks.
- volto-slate has a Table button with the familiar size input, but it create a Table block

While this addon is still in an early alpha stage, we've solved most of the big issues, the API starts to stabilize and we've already started several addons based on it: https://github.com/eea/volto-slate-metadata-mentions/ and https://github.com/eea/volto-slate-zotero

## Note!

For maximum compatibility you should use this for Volto: `https://github.com/eea/volto/tree/modern_kitchen_sink` and register `volto-slate:asDefault` as an addon loader in package.json. See https://github.com/eea/volto-slate-project the demo project that we use to develop this addon.

## Why

Some of the main reasons that drove us to create volto-slate instead of enhancing Volto's draftjs implementation:

- Volto's draftjs implementation depends on draft-js-plugins, a third-party project that introduces its own set of bugs and maintanance issues
- Slate has a modern, developer-friendly api that makes developing plugins something easy to do. Getting the editor in a plugin is as easy as `const editor = useSlate()`, overriding core functionality is something that's built in as pluggable, directly in Slate.

- Volto's draft based implementation depends on Redraft for its final output, which comes with its own bugs and issues. While it is nice to have view-mode components, this is something that volto-slate implements just as well.
- Because Slate's internal storage uses a tree modeled on the DOM pattern, its final rendered output is very clean. Note: The Slate editor value is a JSON object, similar to the Draftjs based implementation.

## Features

#### 1. Hovering (floating) toolbar
![1. Hovering (floating) toolbar](/docs/source/images/1.gif)

#### 2. Fixed toolbar
![2. Fixed toolbar](/docs/source/images/2.gif)

#### 3. Working with links
![3. Working with links](/docs/source/images/3.gif)

#### 4. Callouts
![4. Callouts](/docs/source/images/4.gif)

#### 5. Split paragraph block in two with `Enter` key and join them back with Backspace key
![5. Split paragraph block in two with `Enter` key and join them back with Backspace key](/docs/source/images/5.gif)

#### 6. Splitting a list item with `Enter`
![6. Splitting a list item with `Enter`](/docs/source/images/6.gif)

#### 7. Splitting a list item with `Enter` on expanded selection
![7. Splitting a list item with `Enter` on expanded selection](/docs/source/images/7.gif)

#### 8. Inserting a new list item at the end
![8. Inserting a new list item at the end](/docs/source/images/8.gif)

#### 9. Two `Enter` key presses at the end of a list create a new Slate block with an empty paragraph
![9. Two `Enter` key presses at the end of a list create a new Slate block with an empty paragraph](/docs/source/images/9.gif)

#### 10. Using `Up` and `Down` keys to go through the blocks in both directions
![10. Using `Up` and `Down` keys to go through the blocks in both directions](/docs/source/images/10.gif)

#### 11. Using `Tab` and `Shift-Tab` keys to go through the blocks in both directions
![11. Using `Tab` and `Shift-Tab` keys to go through the blocks in both directions](/docs/source/images/11.gif)

#### 12. Changing indent level of list items (including nested lists!) using `Tab` and `Shift-Tab` keys
![12. Changing indent level of list items (including nested lists!) using `Tab` and `Shift-Tab` keys](/docs/source/images/12.gif)

#### 13. Two `Enter` key presses break a list in two lists
![13. Two `Enter` key presses break a list in two lists](/docs/source/images/13.gif)

#### 14. Support for markdown bulleted lists with `*`, `-` and `+`
![14. Support for markdown bulleted lists with `*`, `-` and `+`](/docs/source/images/14.gif)

#### 15. Support for markdown numbered lists with `1.` - `9.`
![15. Support for markdown numbered lists with `1.` - `9.`](/docs/source/images/15.gif)

#### 16. `Backspace` with cursor on first position inside a list with just one item converts the list to a paragraph
![16. `Backspace` with cursor on first position inside a list with just one item converts the list to a paragraph](/docs/source/images/16.gif)

#### 17. `Backspace` on empty block deletes it and focuses the previous block
![17. `Backspace` on empty block deletes it and focuses the previous block](/docs/source/images/17.gif)

#### 18. Using the toolbar we can switch to a type of list or convert the list to a paragraph
![18. Using the toolbar we can switch to a type of list or convert the list to a paragraph](/docs/source/images/18.gif)

#### 19. The content rendered to the end-user
![19. The content rendered to the end-user](/docs/source/images/19.gif)

## Credit
A lot of inspiration from the great [Slate Plugins repository](https://github.com/udecode/slate-plugins/), especially the autoformat handlers.
