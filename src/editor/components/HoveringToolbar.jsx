import React, { Fragment, useRef, useEffect } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { Editor, Range } from 'slate';
import cx from 'classnames';

import { availableButtons, hoveringToolbarButtons } from '../config';
import MasterToggleButton from './MasterToggleButton';
import BasicToolbar from './BasicToolbar';
import { Portal } from 'react-portal';

const HoveringToolbar = ({
  mainToolbarShown,
  onToggle,
  showMasterToggleButton,
}) => {
  const ref = useRef();

  const editor = useSlate();

  if (typeof showMasterToggleButton !== 'boolean') {
    showMasterToggleButton = true;
  }

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
        <BasicToolbar className="slate-inline-toolbar" ref={ref}>
          {hoveringToolbarButtons.map(name => (
            <Fragment key={name}>{availableButtons[name]}</Fragment>
          ))}
          <MasterToggleButton
            className={cx({ hidden: !showMasterToggleButton })}
            active={mainToolbarShown}
            onToggle={handleOnToggle}
          />
        </BasicToolbar>
      </Portal>
    </div>
  );
};

export default HoveringToolbar;
