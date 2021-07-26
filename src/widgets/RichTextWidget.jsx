/**
 * WysiwygWidget container.
 * @module components/manage/WysiwygWidget/WysiwygWidget
 */

import React from 'react';
import { FormFieldWrapper } from '@plone/volto/components';
import SlateEditor from 'volto-slate/editor/SlateEditor';
import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
import './style.css';
import { createEmptyParagraph } from '../utils/blocks';

const SlateRichTextWidget = (props) => {
  const {
    id,
    onChange,
    value,
    className,
    block,
    placeholder,
    properties,
  } = props;
  const [selected, setSelected] = React.useState(false);
  const slateContainer = React.useRef();
  // make editor.getBlockProps available for extensions
  const withBlockProperties = React.useCallback(
    (editor) => {
      editor.getBlockProps = () => props;
      return editor;
    },
    [props],
  );

  React.useEffect(() => {
    __CLIENT__ &&
      document &&
      document.addEventListener('mousedown', handleClickOutside, false);

    return () => {
      __CLIENT__ &&
        document &&
        document.removeEventListener('mousedown', handleClickOutside, false);
    };
  }, []);

  const handleClickOutside = (e) => {
    let active =
      slateContainer.current && doesNodeContainClick(slateContainer.current, e)
        ? true
        : false;

    setSelected(active);
  };
  return (
    <FormFieldWrapper {...props} draggable={false} className="slate_wysiwyg">
      <div
        className="slate_wysiwyg_box"
        role="textbox"
        tabIndex="-1"
        style={{ boxSizing: 'initial' }}
        onKeyDown={() => {}}
        ref={slateContainer}
      >
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
