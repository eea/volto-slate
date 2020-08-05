import React from 'react';
import { Portal } from 'react-portal';

const PluginToolbarPortal = ({ children, selected }) => {
  return (
    <>
      {selected && __CLIENT__ && (
        <Portal node={document.getElementById('plugin-toolbar')}>
          {children}
        </Portal>
      )}
    </>
  );
};

export default PluginToolbarPortal;
