/**
 * WysiwygWidget container.
 * @module components/manage/WysiwygWidget/WysiwygWidget
 */

import React from 'react';
import { FormFieldWrapper } from '@plone/volto/components';
import SlateEditor from 'volto-slate/editor/SlateEditor';

const SlateRichTextWidget = (props) => {
  const { id, onChange, value, focus } = props;
  // const [selected, setSelected] = React.useState(focus);
  // console.log('props', props);
  // onClick={() => setSelected(true)}
  return (
    <FormFieldWrapper {...props} draggable={false} className="slate_wysiwyg">
      <div style={{ boxSizing: 'initial' }}>
        <SlateEditor
          id={id}
          name={id}
          value={value}
          onChange={(newValue) => {
            onChange(id, newValue);
          }}
          selected={true}
        />
      </div>
    </FormFieldWrapper>
  );
};

export default SlateRichTextWidget;
