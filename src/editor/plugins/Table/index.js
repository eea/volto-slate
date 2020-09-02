import React from 'react';
import { withTable } from './extensions';
import TableButton from './TableButton';
import { tableElements } from './render';
import './less/public.less';

export default function install(config) {
  const { slate } = config.settings;

  slate.extensions = [...(slate.extensions || []), withTable];
  slate.elements = {
    ...slate.elements,
    ...tableElements,
  };

  slate.buttons.table = (props) => <TableButton {...props} title="Table" />;
  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'table'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'table',
  ];

  return config;
}
