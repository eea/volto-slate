# Directory structure

The actual source code of this React-based Volto addon is inside the `src/` directory. Below is the directory structure:

```
docs/ - the documentation that you are reading right now
  ...
src/
  actions/ - Redux action creators specific to volto-slate
  editor/ - The essence of volto-slate: SlateEditor and all of its dependencies
    ui/ - Some React components for Volto Slate toolbars
    plugins/ - The currently 5 plugins that are used directly in the SlateEditor component
    extensions/ - extensions (also called decorators) which are used with SlateEditor
    less/ - The LESS styles for the SlateEditor
  futurevolto/ - Backport of possible future features of Volto, as a plugin, containing a config.js file that is the entry point
  reducers/ - Redux reducers specific to volto-slate
  TextBlock/ - the TextBlockView and TextBlockEdit React components whose roles are presented below
    keyboard/ - keyboard handlers used just in the TextBlockEdit component
    extensions/ - extensions (also called decorators) which are used just with the TextBlockEdit component
  utils/ - lots of functions used in the editor/ and TextBlock/ directories and grouped into 13 files
```

There also are some unit tests near the files that they test and having the extension `.test.jsx`. The unit tests are created with jest and the jest snapshots in directories called `__snapshots__`.

Each direct subdirectory of `src/` except `futurevolto` contains an `index.js` file so that the directory can be imported from other JS files.

The `/src` directory directly contains the `index.js` file which configures the addon. This `index.js` file specifies, in this order:

1. imports of the two React components used as an intermediary between Volto and the `SlateEditor` component defined within volto-slate:
    1. `TextBlockView`
    2. `TextBlockEdit`
2. configuration for the new `slate` block type
3. a change of the default Volto block type to `slate`
4. extensions (also named decorators) and keyboard event handlers for `TextBlockEdit`
5. installs a few default plugins for volto-slate
    1. `Blockquote`
    2. `Link`
    3. `Footnote`
    4. `Markdown`
    5. `Image`
6. installs Volto proposals' widgets:
    1. `"object"` (`ObjectWidget`)
    2. `"object_browser"` (`ObjectBrowserWidget`)
7. installation of the addon's reducers
