import React from 'react';

import SlateEditor from './../editor';
import { plaintext_serialize } from './../editor/render';

// See https://docs.voltocms.com/blocks/anatomy/

const TextBlockEdit = ({
  type,
  id,
  data,
  selected,
  index,
  pathname,
  block,
  onChangeBlock,
  ...props
}) => {
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
