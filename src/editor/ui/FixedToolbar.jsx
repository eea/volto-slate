import React, { useRef, useEffect } from 'react';
import { Portal } from 'react-portal';

import BasicToolbar from './BasicToolbar';

const FixedToolbar = ({ toggleButton, className, children }) => {
  const ref = useRef();
  // const editor = useSlate();
  const [positioned, setPositioned] = React.useState();

  useEffect(() => {
    const el = ref.current;

    if ((children || []).length === 0) {
      el.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection();
    if (domSelection.rangeCount < 1) {
      // don't do anything here, this happens when opening a focus-stealing
      // component, in which case we actually want to keep the toolbar open
      // See
      // https://stackoverflow.com/questions/22935320/uncaught-indexsizeerror-failed-to-execute-getrangeat-on-selection-0-is-not
      return;
    }

    if (!positioned) {
      setTimeout(() => {
        setPositioned(true);
        const domRange = domSelection.getRangeAt(0);
        const rect = domRange.getBoundingClientRect();

        el.style.opacity = 1;
        el.style.top = `${
          rect.top + window.pageYOffset - el.offsetHeight - 6
        }px`;
        el.style.left = `${Math.max(
          rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2,
          0, // if the left edge of the toolbar should be otherwise offscreen
        )}px`;
      }, 10);
    }
  }, [setPositioned, children, positioned]);

  return (
    <Portal>
      <BasicToolbar className={`slate-inline-toolbar ${className}`} ref={ref}>
        {children}
      </BasicToolbar>
    </Portal>
  );
};

export default FixedToolbar;
