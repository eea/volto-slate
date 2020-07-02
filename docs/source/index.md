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

- `slate.buttons` - Object. Define new buttons
- `slate.toolbarButtons` - List. Add new buttons to the hovering toolbar
- `slate.expandedToolbarButtons` - List. Add new buttons to the expanded (fixed) toolbar
- `slate.elements` - Object. define new block elements

