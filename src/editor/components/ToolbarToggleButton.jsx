import React from 'react';
import cx from 'classnames';

import Button from './Button';

import toggleIcon from '@plone/volto/icons/freedom.svg';

const ToolbarToggleButton = ({ active, onToggle, className, ...props }) => {
  // TODO: use flexbox to right-align this button inside the toolbar
  // (not relevant in the current layout of the toolbar)
  return (
    <Button
      {...props}
      className={cx(className, 'master-toggle-button')}
      active={active}
      icon={toggleIcon}
      onMouseDown={(event) => {
        onToggle();
        event.preventDefault();
      }}
    />
  );
};

export default ToolbarToggleButton;
