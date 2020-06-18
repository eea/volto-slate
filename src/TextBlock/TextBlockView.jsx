import React, { useMemo, useCallback } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { Element, Leaf } from '../editor/render';
import { serializeHTMLFromNodes } from './serializeHTMLFromNodes';

// TODO: include plugins/decorators that alter static HTML rendering

const TextBlockView = ({ id, properties, data }) => {
  const { value } = data;
  const serializer = serializeHTMLFromNodes([]);
  let html = serializer(value);
  // console.log('html', html);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default TextBlockView;
