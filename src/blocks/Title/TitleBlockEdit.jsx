/**
 * Edit title block.
 * @module volto-slate/blocks/Title/TitleBlockEdit
 */

import React, {
  useEffect,
  useContext,
  useCallback,
  useRef,
  useMemo,
  useState,
} from 'react';
import { Editor, createEditor } from 'slate';
import {
  ReactEditor,
  Editable,
  Slate,
  withReact,
  useEditor,
  useFocused,
} from 'slate-react';
import cx from 'classnames';

import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import { settings } from '~/config';
import { FormStateContext } from '@plone/volto/components/manage/Form/FormContext';

const messages = defineMessages({
  title: {
    id: 'Type the title…',
    defaultMessage: 'Type the title…',
  },
});

/**
 * Edit title block component.
 * @class TitleBlockEdit
 * @extends Component
 */
export const TitleBlockEdit = ({
  selected,
  index,
  onChangeField,
  onSelectBlock,
  // onDeleteBlock,
  onAddBlock,
  onFocusPreviousBlock,
  onFocusNextBlock,
  block,
  blockNode,
}) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  // const focused = useFocused();
  const intl = useIntl();
  const formContext = useContext(FormStateContext);
  useEffect(() => {
    if (selected) {
      ReactEditor.focus(editor);
    }
  });
  useEffect(() => {
    if (selected) {
      ReactEditor.focus(editor);
    }
  }, [selected]);
  const handleChange = useCallback(() => {
    onChangeField('title', Editor.string(editor, []));
  }, [editor, onChangeField]);

  if (__SERVER__) {
    return <div />;
  }

  console.log('SELECTED ?', selected);

  return (
    <Slate
      editor={editor}
      onChange={handleChange}
      value={[
        {
          type: 'p',
          children: [{ text: formContext.contextData?.formData?.title || '' }],
        },
      ]}
    >
      <Editable
        // className={cx({ selected: true })}
        onKeyDown={(ev) => {
          if (ev.key === 'Return' || ev.key === 'Enter') {
            ev.preventDefault();
            onAddBlock(settings.defaultBlockType, index + 1).then((id) => {
              // the selection is changed automatically to the new block by onAddBlock
            });
          } else if (ev.key === 'ArrowUp') {
            ev.preventDefault();
            onFocusPreviousBlock(block, blockNode.current);
          } else if (ev.key === 'ArrowDown') {
            ev.preventDefault();
            onFocusNextBlock(block, blockNode.current);
          }
        }}
        placeholder={intl.formatMessage(messages.title)}
        renderElement={({ attributes, children, element }) => {
          return (
            <h1 {...attributes} className="documentFirstHeading">
              {children}
            </h1>
          );
        }}
      ></Editable>
    </Slate>
  );
};

TitleBlockEdit.propTypes = {
  // properties: PropTypes.objectOf(PropTypes.any).isRequired,
  selected: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  onChangeField: PropTypes.func.isRequired,
  onSelectBlock: PropTypes.func.isRequired,
  onDeleteBlock: PropTypes.func.isRequired,
  onAddBlock: PropTypes.func.isRequired,
  onFocusPreviousBlock: PropTypes.func.isRequired,
  onFocusNextBlock: PropTypes.func.isRequired,
  block: PropTypes.string.isRequired,
};

export default TitleBlockEdit;
