/**
 * Edit title/description block.
 * @module volto-slate/blocks/Title/TitleBlockEdit
 */

import React, { useContext, useCallback, useMemo } from 'react';
import { Editor, createEditor } from 'slate';
import { ReactEditor, Editable, Slate, withReact } from 'slate-react';
import { fixSelection } from 'volto-slate/utils';
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
  onAddBlock,
  onFocusPreviousBlock,
  onFocusNextBlock,
  block,
  blockNode,
  className,
}) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const intl = useIntl();
  const formContext = useContext(FormStateContext);
  const handleChange = useCallback(() => {
    onChangeField('title', Editor.string(editor, []));
  }, [editor, onChangeField]);

  // TODO: move the code below, copied from SlateEditor component, into a custom hook that is called from both places
  /*
   * We 'restore' the selection because we manipulate it in several cases:
   * - when blocks are artificially joined, we set the selection at junction
   * - when moving up, we set it at end of previous blok
   * - when moving down, we set it at beginning of next block
   */
  React.useLayoutEffect(() => {
    if (selected) {
      ReactEditor.focus(editor);

      // This makes the Backspace key work properly in block.
      // Don't remove it, unless this test passes:
      // - with the Slate block unselected, click in the block.
      // - Hit backspace. If it deletes, then the test passes
      fixSelection(editor);

      // if (defaultSelection) {
      //   if (initial_selection.current !== defaultSelection) {
      //     initial_selection.current = defaultSelection;
      //     setTimeout(() => Transforms.select(editor, defaultSelection), 0);
      //   }
      //   return () => ReactEditor.blur(editor);
      // }
    }
    return () => ReactEditor.blur(editor);
  }, [editor, selected]);

  if (__SERVER__) {
    return <div />;
  }

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
            <h1 {...attributes} className={className}>
              {children}
            </h1>
          );
        }}
        onFocus={() => {
          onSelectBlock(block);
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
  className: PropTypes.string.isRequired,
};

export default TitleBlockEdit;
