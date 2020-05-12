import React, { Fragment } from 'react';
import BasicToolbar from './BasicToolbar';
import { toolbarButtons, availableButtons } from '../config';

const Toolbar = React.forwardRef(({ className }, ref) => (
  <BasicToolbar className={className} ref={ref}>
    {toolbarButtons.map(name => (
      <Fragment key={name}>{availableButtons[name]}</Fragment>
    ))}
  </BasicToolbar>
));

export default Toolbar;
