import React from 'react';

import SlateEditor from './../editor';
import { serialize } from './../editor/render';

const TextBlockEdit = ({ block, data, onChangeBlock, selected, ...props }) => {
  const { value } = data;
  return (
    <SlateEditor
      value={value}
      onChange={value => {
        onChangeBlock(block, {
          ...data,
          value,
          plaintext: serialize(value || []),
        });
      }}
      selected={selected}
    />
  );
};
export default TextBlockEdit;
