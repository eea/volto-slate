import React, { Fragment } from 'react';
import cx from 'classnames';
import MasterToggleButton from './MasterToggleButton';

import BasicToolbar from './BasicToolbar';
import { toolbarButtons, availableButtons } from '../config';

const InlineToolbar = React.forwardRef(
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
        {toolbarButtons.map(name => (
          <Fragment key={name}>{availableButtons[name]}</Fragment>
        ))}
        <MasterToggleButton
          className={cx({ hidden: !showMasterToggleButton })}
          active={mainToolbarShown}
          onToggle={handleOnToggle}
        />
      </BasicToolbar>
    );
  },
);

export default InlineToolbar;
