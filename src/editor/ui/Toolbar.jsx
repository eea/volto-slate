import React, { useRef, useEffect } from 'react';
import { Portal } from 'react-portal';
import { useSlate } from 'slate-react';

import Separator from './Separator';
import BasicToolbar from './BasicToolbar';

const Toolbar = ({
  toggleButton,
  children,
  keepHoveringToolbarOpen,
  setKeepHoveringToolbarOpen,
}) => {
  const ref = useRef();
  const editor = useSlate();

  useEffect(() => {
    const el = ref.current;

    if (!keepHoveringToolbarOpen) {
      //   setKeepHoveringToolbarOpen(true);
      if ((children || []).length === 0) {
        el.removeAttribute('style');
        return;
      }

      const { selection } = editor;
      if (!selection) {
        el.removeAttribute('style');
        return;
      }

      const domSelection = window.getSelection();
      // See
      // https://stackoverflow.com/questions/22935320/uncaught-indexsizeerror-failed-to-execute-getrangeat-on-selection-0-is-not
      if (domSelection.rangeCount < 1) {
        el.removeAttribute('style');
        return;
      }
      const domRange = domSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();

      el.style.opacity = 1;
      el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight - 6}px`;
      el.style.left = `${Math.max(
        rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2,
        0, // if the left edge of the toolbar should be otherwise offscreen
      )}px`;
    } else {
      el.style.opacity = 1;
    }
  });

  return (
    <Portal>
      <BasicToolbar className="slate-inline-toolbar" ref={ref}>
        {children}
        {toggleButton && (
          <>
            <Separator />
            {toggleButton}
          </>
        )}
      </BasicToolbar>
    </Portal>
  );
};

export default Toolbar;
