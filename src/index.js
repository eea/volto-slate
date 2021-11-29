import React, { useMemo } from 'react';
import { createEditor } from 'slate';
import { withReact, Slate, useSlate } from 'slate-react';

export default (config) => {
  return config;
};

export function asDefault(config) {
  const Btn = () => {
    useSlate();
    return null;
  };

  config.settings = config.settings || {};
  config.settings.slate = config.settings.slate || {};
  config.settings.slate.buttons = config.settings.slate.buttons || {};
  config.settings.slate.buttons.mention = Btn;

  config.blocks.blocksConfig.slate = {
    id: 'slate',
    view: () => null,
    edit: () => {
      // NOTE: with this commented out the error appears, otherwise it does not
      // appear:
      // config.settings.slate.buttons.mention = () => {
      //   useSlate();
      //   return null;
      // };

      const editor = useMemo(() => withReact(createEditor()), []);

      const value = useMemo(
        () => [{ type: 'p', children: [{ text: 'abc' }] }],
        [],
      );

      const Button = config.settings.slate.buttons.mention;

      return (
        <Slate editor={editor} value={value}>
          {/* NOTE: if I directly use Btn here instead of Button, there is no error */}
          <Button />
        </Slate>
      );
    },
  };

  return config;
}
