/**
 * Edit title/description block.
 * @module volto-slate/blocks/Title/TitleBlockEdit
 */

import React, { useContext, useCallback, useMemo } from 'react';
import { Editor, createEditor, Node } from 'slate';
import { ReactEditor, Editable, Slate, withReact } from 'slate-react';
import { fixSelection } from 'volto-slate/utils';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import { settings } from '~/config';
import { FormStateContext } from '@plone/volto/components/manage/Form/FormContext';
import { P } from '../../constants';
import cx from 'classnames';

const messages = defineMessages({
  description: {
    id: 'Add a description…',
    defaultMessage: 'Add a description…',
  },
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
  onDeleteBlock,
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
  formFieldName,
}) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const intl = useIntl();
  const formContext = useContext(FormStateContext);
  const handleChange = useCallback(() => {
    onChangeField(formFieldName, Editor.string(editor, []));
  }, [editor, formFieldName, onChangeField]);
  const TitleOrDescription = useMemo(() => {
    let TitleOrDescription;
    if (formFieldName === 'title') {
      TitleOrDescription = React.forwardRef(({ children, ...rest }, ref) => (
        <h1 {...rest} ref={ref}>
          {children}
        </h1>
      ));
    } else {
      TitleOrDescription = React.forwardRef(({ children, ...rest }, ref) => (
        <div {...rest} ref={ref}>
          {children}
        </div>
      ));
    }
    return TitleOrDescription;
  }, [formFieldName]);

  // TODO: move the code below, copied from SlateEditor component, into a custom hook that is called from both places
  React.useLayoutEffect(() => {
    if (selected) {
      ReactEditor.focus(editor);
      fixSelection(editor);
    }
    return () => ReactEditor.blur(editor);
  }, [editor, selected]);

  return (
    <Slate
      editor={editor}
      onChange={handleChange}
      value={[
        {
          type: P,
          children: [
            { text: formContext.contextData?.formData?.[formFieldName] || '' },
          ],
        },
      ]}
      className={cx({
        block: formFieldName === 'description',
        description: formFieldName === 'description',
        selected: formFieldName === 'description' && selected,
      })}
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
        placeholder={intl.formatMessage(messages[formFieldName]) || ''}
        renderElement={({ attributes, children, element }) => {
          return (
            <TitleOrDescription {...attributes} className={className}>
              {children}
            </TitleOrDescription>
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
  onDeleteBlock: PropTypes.func,
  onAddBlock: PropTypes.func.isRequired,
  onFocusPreviousBlock: PropTypes.func.isRequired,
  onFocusNextBlock: PropTypes.func.isRequired,
  block: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  formFieldName: PropTypes.string.isRequired,
};

export default TitleBlockEdit;
