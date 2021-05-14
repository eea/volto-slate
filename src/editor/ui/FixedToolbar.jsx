import React from 'react';
import { Portal } from 'react-portal';

import BasicToolbar from './BasicToolbar';

const FixedToolbar = ({ toggleButton, className, children, position }) => {
  const ref = React.useRef();
  const oldPosition = React.useRef();

  React.useEffect(() => {
    if (!oldPosition.current) {
      oldPosition.current = position;
    }
    const el = ref.current;

    // if ((children || []).length === 0) {
    //   el.removeAttribute('style');
    //   return;
    // }

    const { style } = position || {};
    const left = `${Math.max(style.left - el.offsetWidth / 2, 0)}px`;
    const top = `${style.top - el.offsetHeight}px`;
    // console.log('moving to', left, top);

    el.style.opacity = style.opacity;
    el.style.top = top;
    el.style.left = left;
  });

  return (
    <Portal>
      <BasicToolbar className={`slate-inline-toolbar ${className}`} ref={ref}>
        {children}
      </BasicToolbar>
    </Portal>
  );
};

export default FixedToolbar;
