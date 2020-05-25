import React from 'react';
import cx from 'classnames';

import Button from './Button';
import BasicToolbar from './BasicToolbar';

import toggleIcon from '@plone/volto/icons/freedom.svg';

const ExpandedToolbar = React.forwardRef(
  ({ className, onToggle, mainToolbarShown, children, ...props }, ref) => {
    function handleOnToggle() {
      onToggle();
    }

    return (
      <BasicToolbar {...props} className={className} ref={ref}>
        {children}
        <Button
          onMouseDown={(event) => {
            handleOnToggle();
            event.preventDefault();
          }}
          icon={toggleIcon}
          active={mainToolbarShown}
        />
      </BasicToolbar>
    );
  },
);

export default ExpandedToolbar;
