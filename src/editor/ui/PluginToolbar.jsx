import React from 'react';

const PluginToolbar = ({ pluginToolbarRef, children }) => (
  <div ref={pluginToolbarRef} className="toolbar" id="plugin-toolbar">
    {children}
  </div>
);

export default React.forwardRef((props, ref) => (
  <PluginToolbar {...props} pluginToolbarRef={ref} />
));
