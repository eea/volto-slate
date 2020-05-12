import React, { Fragment } from 'react';
import BasicToolbar from './BasicToolbar';
import { toolbarButtons, availableButtons } from '../config';

const Toolbar = ({ className }) => (
  <BasicToolbar className={className}>
    {toolbarButtons.map(name => (
      <Fragment key={name}>{availableButtons[name]}</Fragment>
    ))}
  </BasicToolbar>
);

export default Toolbar;
