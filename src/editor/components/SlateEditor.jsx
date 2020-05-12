import isHotkey from 'is-hotkey';
import cx from 'classnames';

import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import React, { useMemo, useCallback, useState } from 'react';

import { HOTKEYS, initialValue } from '../constants';
import { Element, Leaf } from '../render';
import HoveringToolbar from './HoveringToolbar';
import InlineToolbar from './InlineToolbar';
import { toggleMark } from '../utils';

const SlateEditor = ({ selected, value, onChange }) => {
  const [showToolbar, setShowToolbar] = useState(false);

  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  function handleOnToggle() {
    setShowToolbar(!showToolbar);
  }

  const shouldShowMasterToggleButton = true;

  return (
    <div
      className={cx('slate-editor', { 'show-toolbar': showToolbar, selected })}
    >
      <Slate editor={editor} value={value || initialValue} onChange={onChange}>
        {!showToolbar && (
          <HoveringToolbar
            onToggle={handleOnToggle}
            mainToolbarShown={showToolbar}
            showMasterToggleButton={shouldShowMasterToggleButton}
          />
        )}
        <div
          className={cx('toolbar-wrapper', { active: showToolbar && selected })}
        >
          {selected && showToolbar && (
            <InlineToolbar
              showMasterToggleButton={shouldShowMasterToggleButton}
              onToggle={handleOnToggle}
              mainToolbarShown={showToolbar}
            />
          )}
        </div>
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

export default SlateEditor;
