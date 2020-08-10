import React from 'react';
import { Portal, PortalWithState } from 'react-portal';

// TODO: add CSS transition on display

const SidebarPopup = (props, ref) => {
  const { children, open, ...rest } = props;
  console.log('sidebar');
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
//
//  <PortalWithState closeOnOutsideClick closeOnEsc defaultOpen {...rest}>
//    {({ portal, closePortal }) =>
//      portal(
//        <aside
//          role="presentation"
//          onClick={(e) => {
//            e.stopPropagation();
//          }}
//          onKeyDown={(e) => {
//            e.stopPropagation();
//          }}
//          ref={ref}
//          key="sidebarpopup"
//          className="sidebar-container"
//        >
//          {children}
//        </aside>,
//      )
//    }
//  </PortalWithState>
