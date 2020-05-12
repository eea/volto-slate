import isHotkey from 'is-hotkey';
import cx from 'classnames';

import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import React, { useMemo, useCallback, useState } from 'react';

import { HOTKEYS, initialValue } from '../config';
import { Element, Leaf } from '../render';
import { HoveringSlateToolbar, SlateToolbar } from '.';
import { toggleMark } from '../utils';

export const SlateEditor = ({ selected, value, onChange }) => {
  const [showToolbar, setShowToolbar] = useState(false);

  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  function handleOnToggle() {
    setShowToolbar(!showToolbar);
  }

  return (
    <div
      className={cx('slate-editor', { 'show-toolbar': showToolbar, selected })}
    >
      <Slate editor={editor} value={value || initialValue} onChange={onChange}>
        <div
          className={cx('toolbar-wrapper', { active: showToolbar && selected })}
        >
          {selected && <>{showToolbar ? <SlateToolbar /> : ''}</>}
        </div>
        <HoveringSlateToolbar
          onToggle={handleOnToggle}
          mainToolbarShown={showToolbar}
        />
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter some rich text…"
          spellCheck
          onKeyDown={event => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            }
          }}
        />
      </Slate>
    </div>
  );
};
