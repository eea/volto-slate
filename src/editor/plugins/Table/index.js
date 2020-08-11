import React from 'react';
import { withTable } from './extensions';
import TableButton from './TableButton';
import { tableElements } from './render';

export default function install(config) {
  const { slate } = config.settings;

  slate.extensions = [...(slate.extensions || []), withTable];
  slate.elements = {
    ...slate.elements,
    ...tableElements,
  };

  slate.buttons.table = (props) => <TableButton {...props} />;
  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'table'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'table',
  ];

  return config;
}
