import React, { useMemo, useCallback } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { Element, Leaf } from './base';

const TextBlockView = ({ data }) => {
  const { value } = data;
  const editor = useMemo(() => withReact(createEditor()), []);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  return (
    <>
      <Slate editor={editor} value={value}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          readOnly
          placeholder="Enter some plain text..."
        />
      </Slate>
    </>
  );
};
export default TextBlockView;
