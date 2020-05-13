import isHotkey from 'is-hotkey';
import cx from 'classnames';

import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';

import React, { useMemo, useCallback, useState } from 'react';

import { initialValue } from '../constants';
import { Element, Leaf } from '../render';
import Toolbar from './Toolbar';
import ExpandedToolbar from './ExpandedToolbar';
import { toggleMark } from '../utils';
import { settings } from '~/config';

import '../less/editor.less';

const SlateEditor = ({ selected, value, onChange }) => {
  const [showToolbar, setShowToolbar] = useState(false);

  const renderElement = useCallback(props => {
    //console.log('renderElement called', { props });

    let el = <Element {...props} />;

    //console.log('renderElement after Element creation', el);

    return el;
  }, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  const { slate } = settings;

  // wrap editor with new functionality. While Slate calls them plugins, we
  // use decorator to avoid confusion. A Volto Slate editor plugins adds more
  // functionality: buttons, new elements, etc.
  //
  // Each decorator is a simple
  // mutator function with signature: editor => editor
  // See https://docs.slatejs.org/concepts/07-plugins and
  // https://docs.slatejs.org/concepts/06-editor
  //
  const editor = useMemo(
    () =>
      (slate.decorators || []).reduce(
        (acc, apply) => apply(acc),
        withHistory(withReact(createEditor())),
      ),
    [slate.decorators],
  );

  function handleOnToggle() {
    setShowToolbar(!showToolbar);
  }

  const shouldShowMasterToggleButton = true;

  //console.log('editor value', value);

  return (
    <div
      className={cx('slate-editor', { 'show-toolbar': showToolbar, selected })}
    >
      <Slate editor={editor} value={value || initialValue} onChange={onChange}>
        {!showToolbar && (
          <Toolbar
            onToggle={handleOnToggle}
            mainToolbarShown={showToolbar}
            showMasterToggleButton={shouldShowMasterToggleButton}
          />
        )}
        <div
          className={cx('toolbar-wrapper', { active: showToolbar && selected })}
        >
          {selected && showToolbar && (
            <ExpandedToolbar
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
            for (const hotkey in slate.hotkeys) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = slate.hotkeys[hotkey];
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
