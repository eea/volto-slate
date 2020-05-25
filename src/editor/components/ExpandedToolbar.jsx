import React from 'react';
import cx from 'classnames';

import ToolbarToggleButton from './ToolbarToggleButton';
import BasicToolbar from './BasicToolbar';

const ExpandedToolbar = React.forwardRef(
  (
    {
      className,
      showMasterToggleButton = true,
      onToggle,
      mainToolbarShown,
      children,
      ...props
    },
    ref,
  ) => {
    function handleOnToggle() {
      onToggle();
    }

    return (
      <BasicToolbar {...props} className={className} ref={ref}>
        {children}
        <ToolbarToggleButton
          className={cx({ hidden: !showMasterToggleButton })}
          reversed={false}
          active={mainToolbarShown}
          onToggle={handleOnToggle}
        />
      </BasicToolbar>
    );
  },
);

export default ExpandedToolbar;
