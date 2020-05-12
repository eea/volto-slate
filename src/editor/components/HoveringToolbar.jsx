import React, { Fragment, useRef, useEffect } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { Editor, Range } from 'slate';

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
      console.log('no el');
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

    console.log('el', el);
    console.log('rect', rect);

    el.style.opacity = 1;
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${rect.left +
      window.pageXOffset -
      el.offsetWidth / 2 +
      rect.width / 2}px`;
  });

  return (
    <div>
      <Portal>
        {/* z-index to be above the admin panes */}
        <Toolbar className="slate-inline-toolbar" ref={ref}>
          {hoveringToolbarButtons.map(name => (
            <Fragment key={name}>{availableButtons[name]}</Fragment>
          ))}
          <MasterToggleButton
            active={mainToolbarShown}
            onToggle={handleOnToggle}
          />
        </Toolbar>
      </Portal>
    </div>
  );
};

export default HoveringSlateToolbar;
