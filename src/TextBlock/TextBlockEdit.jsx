import React from 'react';

import SlateEditor from './../editor';
import { plaintext_serialize } from './../editor/render';

const TextBlockEdit = ({ block, data, onChangeBlock, selected, ...props }) => {
  const { value } = data;

  return (
    <SlateEditor
      value={value}
      onChange={value => {
        onChangeBlock(block, {
          ...data,
          value,
          plaintext: plaintext_serialize(value || []),
        });
      }}
      selected={selected}
    />
  );
};

export default TextBlockEdit;
