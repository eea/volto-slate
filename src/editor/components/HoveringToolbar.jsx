import React, { Fragment, useRef, useEffect } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { Editor, Range } from 'slate';

// TODO: remove this dependency:
import { css } from 'emotion';

import { availableButtons, hoveringToolbarButtons } from '../config';
import MasterToggleButton from './MasterToggleButton';
import Toolbar from './SlateToolbar';
import { Portal } from 'react-portal';

const HoveringSlateToolbar = ({ mainToolbarShown, onToggle }) => {
  const ref = useRef();
  const editor = useSlate();

  function handleOnToggle() {
    onToggle();
  }

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    el.style.opacity = 1;
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${rect.left +
      window.pageXOffset -
      el.offsetWidth / 2 +
      rect.width / 2}px`;
  });

  console.log('rendering toolbar');

  return (
    <div>
      <span>hovering toolbar</span>
      <Portal>
        {/* z-index to be above the admin panes */}
        <Toolbar
          ref={ref}
          className={css`
            padding: 8px 7px 6px;
            position: absolute;
            z-index: 102;
            top: -10000px;
            left: -10000px;
            margin-top: -6px;
            opacity: 0;
            background-color: #fff;
            border-radius: 0.1rem;
            border: 0.1rem solid gray;
            transition: opacity 0.5s;
          `}
        >
          {hoveringToolbarButtons.map(name => (
            <Fragment key={name}>{availableButtons[name]}</Fragment>
          ))}
          <MasterToggleButton
            active={mainToolbarShown}
            onToggle={handleOnToggle}
          />
        </Toolbar>
        <span>hovering toolbar end</span>
      </Portal>
    </div>
  );
};

export default HoveringSlateToolbar;
