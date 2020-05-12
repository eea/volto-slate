import React, { Fragment } from 'react';
import BasicToolbar from './BasicToolbar';
import { toolbarButtons, availableButtons } from '../config';

const InlineToolbar = React.forwardRef(({ className, ...props }, ref) => (
  <BasicToolbar {...props} className={className} ref={ref}>
    {toolbarButtons.map(name => (
      <Fragment key={name}>{availableButtons[name]}</Fragment>
    ))}
  </BasicToolbar>
));

export default InlineToolbar;
