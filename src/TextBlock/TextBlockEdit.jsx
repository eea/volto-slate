/**
 * A lot of inspiration from the great https://github.com/udecode/slate-plugins/,
 * especially the list element and autoformat handlers.
 */

import React, { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';

import { Icon, BlockChooser, SidebarPortal } from '@plone/volto/components';
import addSVG from '@plone/volto/icons/circle-plus.svg';
import { settings } from '~/config';

import { setSlateBlockSelection } from 'volto-slate/actions';
import SlateEditor from 'volto-slate/editor';
import { serializeNodesToText } from 'volto-slate/editor/render';
import ShortcutListing from './ShortcutListing';
import { withList, withDeserializeHtml } from './extensions';
import {
  getBackspaceKeyDownHandlers,
  getFocusRelatedKeyDownHandlers,
  softBreakHandler,
  onKeyDownList,
} from './keyDownHandlers';

const TextBlockEdit = (props) => {
  const {
    block,
    data,
    detached,
    index,
    onAddBlock,
    onChangeBlock,
    onMutateBlock,
    onSelectBlock,
    properties,
    selected,
    setSlateBlockSelection,
    onDeleteBlock,
    onFocusNextBlock,
    onFocusPreviousBlock,
    blockNode,
  } = props;

  const { slate } = settings;
  const { textblockExtensions } = slate;
  const { value } = data;
  const [addNewBlockOpened, setAddNewBlockOpened] = useState();

  // TODO: replace these lines with the comment below
  const keyDownHandlers = useMemo(() => {
    return {
      ...getBackspaceKeyDownHandlers({
        block,
        onDeleteBlock,
        index,
        properties,
        setSlateBlockSelection,
        onChangeBlock,
        onFocusPreviousBlock,
        blockNode,
      }),
      ...getFocusRelatedKeyDownHandlers({
        block,
        blockNode,
        onFocusNextBlock,
        onFocusPreviousBlock,
      }),
      ...slate.keyDownHandlers,
    };
  }, [
    block,
    onDeleteBlock,
    index,
    properties,
    setSlateBlockSelection,
    onChangeBlock,
    onFocusPreviousBlock,
    blockNode,
    onFocusNextBlock,
    slate.keyDownHandlers,
  ]);
  const configuredWithList = useMemo(
    () => withList({ onChangeBlock, onAddBlock, onSelectBlock, index }),
    [index, onAddBlock, onChangeBlock, onSelectBlock],
  );
  // const configuredOnKeyDownList = useMemo(() => onKeyDownList(), []);
  //withBlockProps, withList

  const withBlockProps = (editor) => {
    editor.blockProps = props;
    return editor;
  };

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
        extensions={[
          withBlockProps, // needs to be first, before other block extensions
          configuredWithList,
          withDeserializeHtml,
          ...textblockExtensions,
        ]}
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
            plaintext: serializeNodesToText(value || []),
          });
        }}
        onKeyDown={({ editor, event }) => {
          softBreakHandler(event, editor);

          if (event.isDefaultPrevented()) {
            return;
          }

          // TODO: replace these lines with the comment below:
          keyDownHandlers[event.key] &&
            keyDownHandlers[event.key]({
              ...props,
              editor,
              event,
            });
          // configuredOnKeyDownList(event, editor);
        }}
        selected={selected}
        placeholder="Enter some rich text…"
      />
      {!detached && !data.plaintext && (
        <Button
          basic
          icon
          onClick={() => setAddNewBlockOpened(!addNewBlockOpened)}
          className="block-add-button"
        >
          <Icon name={addSVG} className="block-add-button" size="24px" />
        </Button>
      )}
      {addNewBlockOpened && (
        <BlockChooser onMutateBlock={onMutateBlock} currentBlock={block} />
      )}
    </>
  );
};

export default connect(null, {
  setSlateBlockSelection,
})(TextBlockEdit);
