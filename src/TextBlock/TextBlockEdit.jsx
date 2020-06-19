import React, { useMemo } from 'react';
import SlateEditor from './../editor';
import { plaintext_serialize } from './../editor/render';
import { settings } from '~/config';
import { SidebarPortal } from '@plone/volto/components';
import ShortcutListing from './ShortcutListing';
import { setSlateBlockSelection } from './../actions';
import { connect } from 'react-redux';

import { withHandleBreak } from './decorators';
import {
  getBackspaceKeyDownHandlers,
  getFocusRelatedKeyDownHandlers,
} from './keyDownHandlers';

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

  const keyDownHandlers = useMemo(() => {
    return {
      ...getBackspaceKeyDownHandlers({
        block,
        onDeleteBlock,
        index,
        properties,
        setSlateBlockSelection,
        onChangeBlock,
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
