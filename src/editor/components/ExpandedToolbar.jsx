import React, { Fragment } from 'react';
import cx from 'classnames';
import ToolbarToggleButton from './ToolbarToggleButton';

import BasicToolbar from './BasicToolbar';
import { toolbarButtons, availableButtons } from '../config';

const ExpandedToolbar = React.forwardRef(
  (
    { className, showMasterToggleButton, onToggle, mainToolbarShown, ...props },
    ref,
  ) => {
    if (typeof showMasterToggleButton !== 'boolean') {
      showMasterToggleButton = true;
    }

    function handleOnToggle() {
      onToggle();
    }

    return (
      <BasicToolbar {...props} className={className} ref={ref}>
        {toolbarButtons.map((name, i) => (
          <Fragment key={`${name}-${i}`}>{availableButtons[name]}</Fragment>
        ))}
        <ToolbarToggleButton
          className={cx({ hidden: !showMasterToggleButton })}
          active={mainToolbarShown}
          onToggle={handleOnToggle}
        />
      </BasicToolbar>
    );
  },
);

export default ExpandedToolbar;
