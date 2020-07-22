# volto-slate: a Volto text editor

## Plugin configuration

To configure a new volto-slate plugin, you need to do something like this:

```

export default function install(config) {
  const settings = config.settings;
  settings.slate.buttons = [
    ...settings.slate.buttons,
    'block-quote': <BlockButton ... />
  ];

  return config;
}

```

## Available plugin extension points:

- `slate.buttons` - *Object*. Define new buttons as properties of this object with `string` keys
- `slate.toolbarButtons` - *List*. Add new buttons to the hovering toolbar
- `slate.expandedToolbarButtons` - *List*. Add new buttons to the expanded (fixed) toolbar
- `slate.elements` - *Object*. Define new block elements as properties of this object with `string` keys
- `slate.extensions` - *List*. Decorator functions receiving a Slate.js `Editor` instance and returning a modified `Editor` instance object
- `slate.nodeTypesToHighlight` - *List*. Strings used just in and with the `Footnote` default plugin

### For all the extension points of List type listed above

If replacing it with a new list reference, please take into account the old list stored in the previous reference.

### In addition to the above extension points

Besides all these Volto Slate extension points there are all the other extension points of Volto for Volto Addons.
