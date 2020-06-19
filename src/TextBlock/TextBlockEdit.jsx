import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import React, { useMemo } from 'react';
import { Editor, Transforms, Range, Node, Point } from 'slate';
import SlateEditor from './../editor';
import {
  // fixSelection,
  isCursorAtBlockEnd,
  isCursorAtBlockStart,
} from './../editor/utils';
import { plaintext_serialize } from './../editor/render';
import { settings } from '~/config';
import { SidebarPortal } from '@plone/volto/components';
import ShortcutListing from './ShortcutListing';
import { setSlateBlockSelection } from './../actions';
import { connect } from 'react-redux';

import { LISTTYPES } from './constants';
import { withHandleBreak } from './decorators';

function getPreviousBlock(index, properties) {
  if (index === 0) return;

  // join this block with previous block, if previous block is slate
  const blocksFieldname = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);

  const blocks_layout = properties[blocksLayoutFieldname];
  const prevBlockId = blocks_layout.items[index - 1];
  const prevBlock = properties[blocksFieldname][prevBlockId];
  return [prevBlock, prevBlockId];
}

function isCursorInList(editor) {
  const result = Editor.above(editor, {
    match: (n) => n.type === 'list-item',
  });

  if (!result) {
    return false;
  }

  const [listItemWithSelection, listItemWithSelectionPath] = result;

  // whether the selection is inside a list item
  const listItemCase =
    Range.isCollapsed(editor.selection) && listItemWithSelection;

  return listItemCase;
}

function handleBackspaceInList(editor, prevBlock, event) {
  const [listItemWithSelection, listItemWithSelectionPath] = Editor.above(
    editor,
    {
      match: (n) => n.type === 'list-item',
    },
  );

  // whether the selection is inside a list item
  const listItemCase =
    Range.isCollapsed(editor.selection) && listItemWithSelection;

  // if the selection is collapsed and at node and offset 0
  // or collapsed inside a list item
  if (isCursorAtBlockStart(editor) || listItemCase) {
    // are we in a list-item and is cursor at the beginning of the list item?
    if (listItemCase && editor.selection.anchor.offset === 0) {
      if (
        Node.parent(editor, listItemWithSelectionPath).children.indexOf(
          listItemWithSelection,
        ) === 0
      ) {
        // the cursor is inside the first list-item
        event.stopPropagation();
        event.preventDefault();
        return false; // TODO: join with previous <li> element, if exists
      }
      // else handle by deleting the list-item
      Transforms.liftNodes(editor);
      Transforms.mergeNodes(editor);
      Transforms.mergeNodes(editor, { at: [1] });
      //console.log('editor.children', editor.children);

      event.stopPropagation();
      event.preventDefault();

      return;
    }
  }
  return true;
}

function handleBackspaceInText(editor, prevBlock, event) {
  // To work around current architecture limitations, read the value
  // from previous block. Replace it in the current editor (over
  // which we have control), join with current block value, then use
  // this result for previous block, delete current block

  const prev = prevBlock.value;

  // collapse the selection to its start point
  Transforms.collapse(editor, { edge: 'start' });

  // TODO: do we really want to insert this text here?

  // insert a space before the left edge of the selection
  editor.apply({
    type: 'insert_text',
    path: [0, 0],
    offset: 0,
    text: ' ',
  });

  // collapse the selection to its start point
  Transforms.collapse(editor, { edge: 'start' });

  // insert the contents of the previous editor into the current editor
  Transforms.insertNodes(editor, prev, {
    at: Editor.start(editor, []),
  });

  // not needed currently: delete the useless space inserted above
  //Editor.deleteBackward(editor, { unit: 'character' });

  // merge the contents separated by the collapsed selection
  Transforms.mergeNodes(editor);
}

function blockIsEmpty(editor) {
  const value = editor.children;
  // TODO: this is very optimistic, we might have void nodes that are
  // meaningful. We should test if only one child, with empty text
  if (plaintext_serialize(value || []).length === 0) {
    return true;
  }
}

const TextBlockEdit = (props) => {
  const {
    data,
    selected,
    block,
    onAddBlock,
    onChangeBlock,
    onDeleteBlock,
    onFocusNextBlock,
    onFocusPreviousBlock,
    onSelectBlock,
    blockNode,
    index,
    properties,
    setSlateBlockSelection,
  } = props;

  const { value } = data;

  // TODO: convert these handlers to editor decorations
  const keyDownHandlers = useMemo(() => {
    return {
      Backspace: ({ editor, event }) => {
        if (blockIsEmpty(editor)) {
          event.preventDefault();
          return onDeleteBlock(block, true);
        }

        const [prevBlock = {}, prevBlockId] = getPreviousBlock(
          index,
          properties,
        );

        if (prevBlock['@type'] !== 'slate') return;

        const isAtBlockStart = isCursorAtBlockStart(editor);

        if (!isAtBlockStart) return;

        event.stopPropagation();
        event.preventDefault();

        if (isCursorInList(editor)) {
          handleBackspaceInList(editor, prevBlock, event);
        } else {
          handleBackspaceInText(editor, prevBlock);
        }

        const selection = JSON.parse(JSON.stringify(editor.selection));
        const combined = JSON.parse(JSON.stringify(editor.children));

        // TODO: don't remove undo history, etc
        // TODO: after Enter, the current filled-with-previous-block
        // block is visible for a fraction of second

        // setTimeout ensures setState has been successfully
        // executed in Form.jsx. See
        // https://github.com/plone/volto/issues/1519

        setSlateBlockSelection(prevBlockId, selection);

        setTimeout(() => {
          onChangeBlock(prevBlockId, {
            '@type': 'slate',
            value: combined,
            plaintext: plaintext_serialize(combined || []),
          });
          setTimeout(() => onDeleteBlock(block, true));
        });

        return;
      },

      ...settings.slate?.getKeyDownHandlers({
        block,
        blockNode,
        onFocusNextBlock,
        onFocusPreviousBlock,
      }),
    };
  }, [
    block,
    blockNode,
    index,
    onFocusNextBlock,
    onFocusPreviousBlock,
    onDeleteBlock,
    onChangeBlock,
    properties,
    setSlateBlockSelection,
  ]);

  const configuredWithHandleBreak = withHandleBreak(
    index,
    onAddBlock,
    onChangeBlock,
    onSelectBlock,
  );

  let timeoutTillRerender = null;
  React.useEffect(() => {
    return () => {
      if (timeoutTillRerender) {
        clearTimeout(timeoutTillRerender);
      }
    };
  });

  return (
    <>
      <SidebarPortal selected={selected}>
        <div id="slate-plugin-sidebar"></div>
        <ShortcutListing />
      </SidebarPortal>
      <SlateEditor
        index={index}
        properties={properties}
        onAddBlock={onAddBlock}
        decorators={[configuredWithHandleBreak]}
        onSelectBlock={onSelectBlock}
        value={value}
        data={data}
        block={block}
        onChange={(value, selection) => {
          // without using setTimeout, the user types characters on the right side of the text cursor
          timeoutTillRerender = setTimeout(() => {
            setSlateBlockSelection(block, selection);
          });

          onChangeBlock(block, {
            ...data,
            value,
            plaintext: plaintext_serialize(value || []),
          });
        }}
        onKeyDown={({ editor, event }) => {
          keyDownHandlers[event.key] &&
            keyDownHandlers[event.key]({
              ...props,
              editor,
              event,
            });
        }}
        selected={selected}
        placeholder="Enter some rich text…"
      />
    </>
  );
};

export default connect(null, {
  setSlateBlockSelection,
})(TextBlockEdit);
