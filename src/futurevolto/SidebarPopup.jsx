import React from 'react';
import ReactDOM from 'react-dom';

const SidebarPopup = (props, ref) => {
  const { children, open } = props;
  return open
    ? ReactDOM.createPortal(
        <aside
          role="presentation"
          onClick={(e) => {
            e.stopPropagation();
          }}
          ref={ref}
          key="sidebarpopup"
          className="sidebar-container selected"
        >
          {children}
        </aside>,
        document.body,
      )
    : '';
};

export default React.forwardRef(SidebarPopup);
