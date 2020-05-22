import isHotkey from 'is-hotkey';
import cx from 'classnames';
import { createEditor } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import React, { useCallback, useState, Fragment } from 'react';

import { Element, Leaf } from '../render';
import Toolbar from './Toolbar';
import ExpandedToolbar from './ExpandedToolbar';
import { toggleMark, breakEmptyReset, withDelete } from '../utils';
import { settings } from '~/config';

const SlateEditor = ({
  selected,
  value,
  onChange,
  data,
  block,
  useExpandToolbar,
  placeholder,
  onKeyDown,
  properties,
  onAddBlock,
  onSelectBlock,
  decorators,
  index,
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const {
    expandedToolbarButtons,
    toolbarButtons,
    availableButtons,
  } = settings.slate;

  const renderElement = useCallback((props) => {
    return <Element {...props} />;
  }, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const { slate } = settings;

  // wrap editor with new functionality. While Slate calls them plugins, we
  // use decorator to avoid confusion. A Volto Slate editor plugins adds more
  // functionality: buttons, new elements, etc.
  // (editor) => editor
  //
  // Each decorator is a simple mutator function with signature: editor =>
  // editor. See https://docs.slatejs.org/concepts/07-plugins and
  // https://docs.slatejs.org/concepts/06-editor

  const localdecos = React.useRef(decorators || []);

  const editor = React.useMemo(() => {
    console.log('index: ', index);

    const raw = withHistory(withReact(createEditor()));
    const withBreakEmptyReset = breakEmptyReset({
      types: ['bulleted-list', 'numbered-list'],
      typeP: 'paragraph',
      newBlockIndex: index + 1,
      onAddBlock,
      onSelectBlock,
    });
    const decos = [
      withDelete,
      withBreakEmptyReset,
      ...(slate.decorators || []),
      ...localdecos.current,
    ];
    return decos.reduce((acc, apply) => apply(acc), raw);
  }, [index, onAddBlock, onSelectBlock, slate.decorators]);

  React.useLayoutEffect(() => {
    if (selected) {
      ReactEditor.focus(editor);

      const sel = window.getSelection();
      sel.collapse(
        sel.focusNode,
        sel.anchorOffset > 0 ? sel.anchorOffset - 1 : 0,
      );
      sel.collapse(
        sel.focusNode,
        sel.anchorOffset > 0 ? sel.anchorOffset + 1 : 0,
      );
    }
    //return () => ReactEditor.blur(editor);
  }, [editor, selected, block]);

  const initialValue = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];

  return (
    <div
      className={cx('slate-editor', { 'show-toolbar': showToolbar, selected })}
    >
      <Slate editor={editor} value={value || initialValue} onChange={onChange}>
        {!showToolbar && (
          <Toolbar
            onToggle={() => setShowToolbar(!showToolbar)}
            mainToolbarShown={showToolbar}
            showMasterToggleButton={useExpandToolbar}
          >
            {toolbarButtons.map((name, i) => (
              <Fragment key={`${name}-${i}`}>
                {availableButtons[name]()}
              </Fragment>
            ))}
          </Toolbar>
        )}
        <div
          className={cx('toolbar-wrapper', { active: showToolbar && selected })}
        >
          {selected && showToolbar && (
            <ExpandedToolbar
              showMasterToggleButton={useExpandToolbar}
              onToggle={() => setShowToolbar(!showToolbar)}
              mainToolbarShown={showToolbar}
            >
              {expandedToolbarButtons.map((name, i) => (
                <Fragment key={`${name}-${i}`}>
                  {availableButtons[name]()}
                </Fragment>
              ))}
            </ExpandedToolbar>
          )}
        </div>
        <Editable
          readOnly={!selected}
          placeholder={placeholder}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            let wasHotkey = false;

            for (const hotkey in slate.hotkeys) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = slate.hotkeys[hotkey];
                toggleMark(editor, mark);
                wasHotkey = true;
              }
            }

            if (wasHotkey) {
              return;
            }

            onKeyDown && onKeyDown({ editor, event });
          }}
        />
      </Slate>
    </div>
  );
};

export default SlateEditor;
