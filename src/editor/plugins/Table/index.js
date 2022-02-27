import React from 'react';
import { TABLE } from 'volto-slate/constants';

import { tableElements } from './render';

import { withTable } from './extensions';
import TableButton from './TableButton';
import {
  DeleteCol,
  DeleteRow,
  DeleteTable,
  InsertColAfter,
  InsertColBefore,
  InsertRowAfter,
  InsertRowBefore,
} from './Buttons';

import './less/public.less';

export default function install(config) {
  const { slate } = config.settings;

  slate.extensions = [...(slate.extensions || []), withTable];
  slate.elements = {
    ...slate.elements,
    ...tableElements,
  };
  slate.elementToolbarButtons[TABLE] = [
    DeleteTable,
    InsertRowBefore,
    InsertRowAfter,
    DeleteRow,
    InsertColBefore,
    InsertColAfter,
    DeleteCol,
  ];

  return config;
}

export const installTableButton = (config) => {
  const { slate } = config.settings;
  slate.buttons.table = (props) => <TableButton {...props} title="Table" />;
  slate.toolbarButtons = [...(slate.toolbarButtons || []), 'table'];
  slate.expandedToolbarButtons = [
    ...(slate.expandedToolbarButtons || []),
    'table',
  ];
  return config;
};
