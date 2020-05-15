import React, { Fragment } from 'react';
import cx from 'classnames';

import ToolbarToggleButton from './ToolbarToggleButton';
import BasicToolbar from './BasicToolbar';
import { settings } from '~/config';

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

    const { expandedToolbarButtons, availableButtons } = settings.slate;

    return (
      <BasicToolbar {...props} className={className} ref={ref}>
        {expandedToolbarButtons.map((name, i) => (
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
