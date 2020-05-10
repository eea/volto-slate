import isHotkey from 'is-hotkey';
import cx from 'classnames';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import React, { useMemo, useCallback, useState, Fragment } from 'react';
import toggleIcon from '@plone/volto/icons/freedom.svg';

import { HOTKEYS, toolbarButtons, availableButtons } from './config';
import { Element, Leaf } from './render';
import { Toolbar, Button } from './components';
import { toggleMark } from './utils';

import './less/editor.less';

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

const SlateToolbar = props => (
  <Toolbar>
    {toolbarButtons.map(name => (
      <Fragment key={name}>{availableButtons[name]}</Fragment>
    ))}
  </Toolbar>
);

const SlateEditor = ({ selected, value, onChange }) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <div
      className={cx('slate-editor', { 'show-toolbar': showToolbar, selected })}
    >
      <Slate editor={editor} value={value || initialValue} onChange={onChange}>
        <div
          className={cx('toolbar-wrapper', { active: showToolbar && selected })}
        >
          {selected && (
            <>
              <Button
                onMouseDown={() => setShowToolbar(!showToolbar)}
                active={showToolbar}
                icon={toggleIcon}
                style={{ float: 'right' }}
              />
              {showToolbar ? <SlateToolbar /> : ''}
            </>
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
