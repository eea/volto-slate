import React from 'react';

import toggleIcon from '@plone/volto/icons/freedom.svg';
import Button from './Button';

const MasterToggleButton = ({ active, onToggle, ...props }) => {
  // TODO: use flexbox to right-align this button inside the toolbar
  // (not relevant in the current layout of the toolbar)
  return (
    <Button
      {...props}
      active={active}
      icon={toggleIcon}
      onMouseDown={event => {
        onToggle();
        event.preventDefault();
      }}
    />
  );
};

export default MasterToggleButton;
