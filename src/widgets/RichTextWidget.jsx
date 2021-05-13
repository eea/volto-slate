/**
 * WysiwygWidget container.
 * @module components/manage/WysiwygWidget/WysiwygWidget
 */

import React from 'react';
import { FormFieldWrapper } from '@plone/volto/components';
import SlateEditor from 'volto-slate/editor/SlateEditor';
import { Pluggable } from '@plone/volto/components/manage/Pluggable';

import './style.css';
import { createEmptyParagraph } from '../utils/blocks';

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
        <Pluggable name="slate-editor-toolbar" />
        <SlateEditor
          className={className}
          id={id}
          name={id}
          value={
            typeof value === 'undefined' ||
            typeof value.data !==
              'undefined' /* previously this was a Draft block */
              ? [createEmptyParagraph()]
              : value
          }
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
