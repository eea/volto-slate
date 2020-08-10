import React from 'react';
import { Portal } from 'react-portal';

// TODO: add CSS transition on display

const SidebarPopup = ({ children, open }, ref) => {
  console.log('sidebar', open);
  return open ? (
    <Portal>
      <aside
        role="presentation"
        onClick={(e) => {
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        ref={ref}
        key="sidebarpopup"
        className="sidebar-container"
      >
        {children}
      </aside>
    </Portal>
  ) : (
    ''
  );
};

export default React.forwardRef(SidebarPopup);
