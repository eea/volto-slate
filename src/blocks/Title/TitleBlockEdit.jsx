/**
 * Edit title/description block.
 * @module volto-slate/blocks/Title/TitleBlockEdit
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Editor, Node, Transforms, Range, createEditor } from 'slate';
import { ReactEditor, Editable, Slate, withReact } from 'slate-react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import config from '@plone/volto/registry';
import { P } from 'volto-slate/constants';
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
    metadata,
    data,
    detached,
    editable,
  } = props;

  const [editor] = useState(withReact(createEditor()));
  const [initialValue] = useState([
    {
      type: P,
      children: [
        {
          text: metadata?.[formFieldName] || properties?.[formFieldName] || '',
        },
      ],
    },
  ]);

  const intl = useIntl();

  const prevSelected = usePrevious(selected);

  const text = useMemo(
    () => metadata?.[formFieldName] || properties?.[formFieldName] || '',
    [metadata, properties, formFieldName],
  );

  const placeholder = useMemo(
    () => data.placeholder || intl.formatMessage(messages[formFieldName]),
    [data.placeholder, formFieldName, intl],
  );
  const disableNewBlocks = useMemo(() => detached, [detached]);

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

  useEffect(() => {
    if (!prevSelected && selected) {
      if (editor.selection && Range.isCollapsed(editor.selection)) {
        // keep selection
        ReactEditor.focus(editor);
      } else {
        // nothing is selected, move focus to end
        ReactEditor.focus(editor);
        Transforms.select(editor, Editor.end(editor, []));
      }
    }
  }, [prevSelected, selected, editor]);

  useEffect(() => {
    // undo/redo handler
    const oldText = Node.string(editor);
    if (oldText !== text) {
      Transforms.insertText(editor, text, {
        at: [0, 0],
      });
    }
  }, [editor, text]);

  const handleChange = useCallback(() => {
    const newText = Node.string(editor);
    if (newText !== text) {
      onChangeField(formFieldName, newText);
    }
  }, [editor, formFieldName, onChangeField, text]);

  const handleKeyDown = useCallback(
    (ev) => {
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
    },
    [
      index,
      blockNode,
      formFieldName,
      editor,
      onDeleteBlock,
      disableNewBlocks,
      onSelectBlock,
      onAddBlock,
      onFocusPreviousBlock,
      onFocusNextBlock,
      block,
    ],
  );

  const handleFocus = useCallback(() => {
    onSelectBlock(block);
  }, [block, onSelectBlock]);

  const renderElement = useCallback(
    ({ attributes, children, element }) => {
      return (
        <TitleOrDescription {...attributes} className={className}>
          {children}
        </TitleOrDescription>
      );
    },
    [TitleOrDescription, className], // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (typeof window.__SERVER__ !== 'undefined') {
    return <div />;
  }

  return (
    <Slate
      editor={editor}
      onChange={handleChange}
      value={initialValue}
      className={cx({
        block: formFieldName === 'description',
        description: formFieldName === 'description',
        selected: formFieldName === 'description' && selected,
      })}
    >
      <Editable
        readOnly={!editable}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        renderElement={renderElement}
        onFocus={handleFocus}
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
  blockNode: PropTypes.any,
  className: PropTypes.string,
  formFieldName: PropTypes.string,
};

TitleBlockEdit.defaultProps = {
  detached: false,
  editable: true,
};

export default TitleBlockEdit;
