/**
 * Edit title/description block.
 * @module volto-slate/blocks/Title/TitleBlockEdit
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Editor, createEditor, Transforms, Node, Range } from 'slate';
import { ReactEditor, Editable, Slate, withReact } from 'slate-react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import config from '@plone/volto/registry';
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

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Edit title block component.
 * @class TitleBlockEdit
 * @extends Component
 */
export const TitleBlockEdit = (props) => {
  const {
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
    properties,
    data,
    detached,
    editable,
  } = props;

  const editor = useMemo(() => withReact(createEditor()), []);
  const intl = useIntl();

  const handleChange = useCallback(
    (value) => {
      if (Node.string({ children: value }) !== properties?.[formFieldName]) {
        onChangeField(formFieldName, Editor.string(editor, []));
      }
    },
    [editor, formFieldName, onChangeField],
  );

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

  const prevSelected = usePrevious(selected);

  useEffect(() => {
    if (!prevSelected && selected) {
      if (editor.selection && Range.isCollapsed(editor.selection)) {
        // keep selection
        ReactEditor.focus(editor);
      } else {
        // nothing is selected, move focus to end
        setTimeout(() => {
          ReactEditor.focus(editor);
          Transforms.select(editor, Editor.end(editor, []));
        });
      }
    }
  }, [prevSelected, selected]);

  if (__SERVER__) {
    return <div />;
  }

  const placeholder =
    data.placeholder || intl.formatMessage(messages[formFieldName]);

  const disableNewBlocks = data.disableNewBlocks || detached;

  const { settings } = config;

  return (
    <Slate
      editor={editor}
      onChange={handleChange}
      value={[
        {
          type: P,
          children: [{ text: properties?.[formFieldName] || '' }],
        },
      ]}
      className={cx({
        block: formFieldName === 'description',
        description: formFieldName === 'description',
        selected: formFieldName === 'description' && selected,
      })}
    >
      <Editable
        readOnly={!editable}
        onKeyDown={(ev) => {
          if (
            formFieldName === 'description' &&
            ev.key === 'Backspace' &&
            Node.string(editor).length === 0
          ) {
            ev.preventDefault();
            onDeleteBlock(block, true);
          } else if (ev.key === 'Return' || ev.key === 'Enter') {
            ev.preventDefault();
            if (!disableNewBlocks) {
              onSelectBlock(
                onAddBlock(config.settings.defaultBlockType, index + 1),
              );
            }
          } else if (ev.key === 'ArrowUp') {
            ev.preventDefault();
            onFocusPreviousBlock(block, blockNode.current);
          } else if (ev.key === 'ArrowDown') {
            ev.preventDefault();
            onFocusNextBlock(block, blockNode.current);
          }
        }}
        placeholder={placeholder}
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
  properties: PropTypes.objectOf(PropTypes.any).isRequired,
  selected: PropTypes.bool.isRequired,
  block: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onChangeField: PropTypes.func.isRequired,
  onSelectBlock: PropTypes.func.isRequired,
  onDeleteBlock: PropTypes.func.isRequired,
  onAddBlock: PropTypes.func.isRequired,
  onFocusPreviousBlock: PropTypes.func.isRequired,
  onFocusNextBlock: PropTypes.func.isRequired,
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  editable: PropTypes.bool,
  detached: PropTypes.bool,
};

TitleBlockEdit.defaultProps = {
  detached: false,
  editable: true,
};

export default TitleBlockEdit;
