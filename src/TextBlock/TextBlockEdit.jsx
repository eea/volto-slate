import React, { useMemo } from 'react';
import SlateEditor from './../editor';
import { getDOMSelectionInfo } from './../editor/utils';
import { plaintext_serialize } from './../editor/render';
import { settings } from '~/config';
import { SidebarPortal } from '@plone/volto/components';
import ShortcutListing from './ShortcutListing';

const TextBlockEdit = (props) => {
  const { data, selected, block, onChangeBlock } = props;
  const { value } = data;

  const keyDownHandlers = useMemo(() => {
    return {
      ArrowUp: ({ editor, event, selection }) => {
        event.stopPropagation();
      },

      ArrowDown: ({ editor, event, selection }) => {
        event.stopPropagation();
      },

      Backspace: ({ editor, event, selection, onDeleteBlock, id, data }) => {
        const { start, end } = selection;
        const { value } = data;

        if (start === end && start === 0) {
          if (plaintext_serialize(value || []).length === 0) {
            event.preventDefault();
            return onDeleteBlock(id, true);
          }
        }
        return true;
      },

      Enter: ({ event }) => {
        // event.preventDefault();
        event.stopPropagation();
        return true;
      },

      ...settings.slate?.keyDownHandlers,
    };
  }, []);

  return (
    <>
      <SidebarPortal selected={selected}>
        <div id="slate-plugin-sidebar"></div>
        <ShortcutListing />
      </SidebarPortal>
      <SlateEditor
        value={value}
        data={data}
        block={block}
        onChange={(value) => {
          onChangeBlock(block, {
            ...data,
            value,
            plaintext: plaintext_serialize(value || []),
          });
        }}
        onKeyDown={(editor, event) => {
          return keyDownHandlers[event.key]
            ? keyDownHandlers[event.key]({
                ...props,
                editor,
                event,
                selection: getDOMSelectionInfo(),
              })
            : null;
        }}
        selected={selected}
        placeholder="Enter some rich text…"
      />
    </>
  );
};

export default TextBlockEdit;
