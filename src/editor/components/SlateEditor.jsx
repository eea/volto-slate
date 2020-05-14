import isHotkey from 'is-hotkey';
import cx from 'classnames';

import { createEditor } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';

import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from 'react';

import { initialValue } from '../constants';
import { Element, Leaf } from '../render';
import Toolbar from './Toolbar';
import ExpandedToolbar from './ExpandedToolbar';
import { toggleMark } from '../utils';
import { settings } from '~/config';
import { Icon, BlockChooser } from '@plone/volto/components';
import { plaintext_serialize } from '../../editor/render';

import { Button } from 'semantic-ui-react';
import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';

import addSVG from '@plone/volto/icons/circle-plus.svg';

const SlateEditor = ({
  selected,
  value,
  onChange,
  onFirstPositionBackspace,
  data,
  detached,
  onMutateBlock,
  onFocusPreviousBlock,
  block,
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [addNewBlockOpened, setAddNewBlockOpened] = useState(false);

  const outerDivRef = useRef(null);

  const renderElement = useCallback((props) => {
    return <Element {...props} />;
  }, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

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

  const toggleAddNewBlock = () => setAddNewBlockOpened(!addNewBlockOpened);

  const handleClickOutside = (e) => {
    if (outerDivRef.current && doesNodeContainClick(outerDivRef.current, e))
      return;
    setAddNewBlockOpened(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside, false);

    // TODO: replace: UNSAFE_componentWillReceiveProps(nextProps)

    return function () {
      document.removeEventListener('mousedown', handleClickOutside, false);
    };
  });

  useEffect(() => {
    ReactEditor.focus(editor);
  }, []);

  function handleOnToggle() {
    setShowToolbar(!showToolbar);
  }

  const shouldShowMasterToggleButton = true;

  return (
    <div
      ref={outerDivRef}
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

            const domSelection = window.getSelection();
            const domRange = domSelection.getRangeAt(0);
            const start = domRange.startOffset;
            const end = domRange.endOffset;

            if (typeof onFirstPositionBackspace === 'function') {
              if (event.key === 'Backspace' && start === end && start === 0) {
                event.preventDefault();
                onFirstPositionBackspace();
                return;
              }
            }

            if (event.key === 'Up') {
              // TODO: what if the cursor is on the first line, not on the first char?
              // const selectionState = this.state.editorState.getSelection();
              // const currentCursorPosition = selectionState.getStartOffset();

              const currentCursorPosition = start;

              if (currentCursorPosition === 0) {
                // TODO: where do I get the `node` from?
                //onFocusPreviousBlock(block, node);

                event.preventDefault();
                return;
              }
            }

            if (event.key === 'Down') {
              // TODO: translate this Draft.js code to Slate.js code:
              // const selectionState = this.state.editorState.getSelection();
              // const { editorState } = this.state;
              // const currentCursorPosition = selectionState.getStartOffset();
              // const blockLength = editorState
              //   .getCurrentContent()
              //   .getFirstBlock()
              //   .getLength();

              // if (currentCursorPosition === blockLength) {
              //   this.props.onFocusNextBlock(this.props.block, this.node);
              // }

              event.preventDefault();
              return;
            }
          }}
        />
        {!detached && plaintext_serialize(value || initialValue).length === 0 && (
          <Button
            basic
            icon
            onClick={toggleAddNewBlock}
            className="block-add-button"
          >
            <Icon name={addSVG} className="block-add-button" size="24px" />
          </Button>
        )}
        {addNewBlockOpened && (
          <BlockChooser onMutateBlock={onMutateBlock} currentBlock={block} />
        )}
      </Slate>
    </div>
  );
};

export default SlateEditor;
