/**
 * WysiwygWidget container.
 * @module widgets/RichTextWidget
 */

import React from 'react';
import { FormFieldWrapper } from '@plone/volto/components';
import SlateEditor from 'volto-slate/editor/SlateEditor';

import './style.css';
import { createEmptyParagraph } from '../utils/blocks';

const isValueValid = (value) => {
  return (
    typeof value !== 'undefined' && typeof value.data === 'undefined' // `data` is specific to Draft blocks that could be transformed into volto-slate blocks
  );
};

const SlateRichTextWidget = (props) => {
  const {
    id,
    onChange,
    value,
    focus,
    className,
    block,
    placeholder,
    properties,
  } = props;
  const [selected, setSelected] = React.useState(focus);
  // make editor.getBlockProps available for extensions
  const withBlockProperties = React.useCallback(
    (editor) => {
      editor.getBlockProps = () => props;
      return editor;
    },
    [props],
  );
  return (
    <FormFieldWrapper {...props} draggable={false} className="slate_wysiwyg">
      <div
        className="slate_wysiwyg_box"
        role="textbox"
        tabIndex="-1"
        style={{ boxSizing: 'initial' }}
        onClick={() => {
          setSelected(true);
        }}
        onKeyDown={() => {}}
      >
        <SlateEditor
          className={className}
          id={id}
          name={id}
          value={isValueValid(value) ? value : [createEmptyParagraph()]}
          onChange={(newValue) => {
            onChange(id, newValue);
          }}
          block={block}
          renderExtensions={[withBlockProperties]}
          selected={selected}
          properties={properties}
          placeholder={placeholder}
        />
      </div>
    </FormFieldWrapper>
  );
};

export default SlateRichTextWidget;
