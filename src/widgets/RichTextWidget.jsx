/**
 * WysiwygWidget container.
 * @module components/manage/WysiwygWidget/WysiwygWidget
 */

import React from 'react';
import { FormFieldWrapper } from '@plone/volto/components';
import SlateEditor from 'volto-slate/editor/SlateEditor';

const SlateRichTextWidget = (props) => {
  const { id, onChange, value, focus } = props;
  const [selected, setSelected] = React.useState(focus);
  return (
    <FormFieldWrapper {...props} draggable={false} className="slate_wysiwyg">
      <div
        role="textbox"
        tabindex="-1"
        style={{ boxSizing: 'initial' }}
        onClick={() => {
          setSelected(true);
        }}
        onKeyDown={() => {}}
      >
        <SlateEditor
          id={id}
          name={id}
          value={value}
          onChange={(newValue) => {
            onChange(id, newValue);
          }}
          selected={selected}
        />
      </div>
    </FormFieldWrapper>
  );
};

export default SlateRichTextWidget;
