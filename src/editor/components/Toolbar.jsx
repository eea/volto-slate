import React, { useRef, useEffect } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { Editor, Range } from 'slate';
import { Portal } from 'react-portal';

import ToolbarButton from './ToolbarButton';
import BasicToolbar from './BasicToolbar';

import toggleIcon from '@plone/volto/icons/freedom.svg';

const Toolbar = ({ mainToolbarShown, onToggle, children }) => {
  const ref = useRef();
  const editor = useSlate();

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

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
    el.style.left = `${Math.max(
      rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2,
      0, // if the left edge of the toolbar should be otherwise offscreen
    )}px`;
  });

  return (
    <Portal>
      <BasicToolbar className="slate-inline-toolbar" ref={ref}>
        {children}
        <ToolbarButton
          onMouseDown={(event) => {
            onToggle();
            event.preventDefault();
          }}
          icon={toggleIcon}
          active={mainToolbarShown}
        />
      </BasicToolbar>
    </Portal>
  );
};

export default Toolbar;
