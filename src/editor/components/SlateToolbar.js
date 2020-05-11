import React, { Fragment } from 'react';
import { Toolbar } from '../components';
import { toolbarButtons, availableButtons } from '../config';

export const SlateToolbar = props => (
  <Toolbar>
    {toolbarButtons.map(name => (
      <Fragment key={name}>{availableButtons[name]}</Fragment>
    ))}
  </Toolbar>
);

export default SlateToolbar;
