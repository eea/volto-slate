import React from 'react';
import { Portal } from 'react-portal';

/**
 * Displays the children inside #slate-plugin-sidebar element only if `selected`
 * is truish.
 *
 * @description As of 23 september 2020 this component is unused.
 *
 * @param {object} props
 * @param {any} props.children
 * @param {boolean} props.selected
 */
const PluginSidebar = ({ children, selected }) => {
  return (
    <>
      {selected && (
        <Portal
          node={__CLIENT__ && document.getElementById('slate-plugin-sidebar')}
        >
          {children}
        </Portal>
      )}
    </>
  );
};

export default PluginSidebar;
