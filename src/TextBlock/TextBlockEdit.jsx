/**
 * A lot of inspiration from the great https://github.com/udecode/slate-plugins/,
 * especially the list element.
 */

import React, { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';

import { Icon, BlockChooser, SidebarPortal } from '@plone/volto/components';
import addSVG from '@plone/volto/icons/circle-plus.svg';
import { settings } from '~/config';

import { setSlateBlockSelection } from './../actions';
import SlateEditor from './../editor';
import { plaintext_serialize } from './../editor/render';
import ShortcutListing from './ShortcutListing';
import { withList, withDeserializeHtml } from './decorators';
import {
  getBackspaceKeyDownHandlers,
  getFocusRelatedKeyDownHandlers,
  onKeyDownList,
} from './keyDownHandlers';

const TextBlockEdit = (props) => {
  const {
    block,
    blockNode,
    data,
    detached,
    index,
    onAddBlock,
    onChangeBlock,
    onDeleteBlock,
    onFocusNextBlock,
    onFocusPreviousBlock,
    onMutateBlock,
    onSelectBlock,
    properties,
    selected,
    setSlateBlockSelection,
  } = props;

  const { value } = data;
  const [addNewBlockOpened, setAddNewBlockOpened] = useState();

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
      ...settings.slate?.keyDownHandlers,
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

  const configuredWithList = useMemo(
    () => withList({ onChangeBlock, onAddBlock, onSelectBlock, index }),
    [index, onAddBlock, onChangeBlock, onSelectBlock],
  );

  const configuredOnKeyDownList = useMemo(() => onKeyDownList(), []);

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
        decorators={[configuredWithList, withDeserializeHtml]}
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
          configuredOnKeyDownList(event, editor);

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
