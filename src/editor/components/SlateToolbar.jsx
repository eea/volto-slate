import React, { Fragment } from 'react';
import Toolbar from './Toolbar';
import { toolbarButtons, availableButtons } from '../config';

const SlateToolbar = ({ className }) => (
  <Toolbar className={className}>
    {toolbarButtons.map(name => (
      <Fragment key={name}>{availableButtons[name]}</Fragment>
    ))}
  </Toolbar>
);

export default SlateToolbar;
