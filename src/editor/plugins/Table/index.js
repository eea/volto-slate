import React from 'react';
import { withTable } from './extensions';
import TableButton from './TableButton';
import { tableElements } from './render';
import './less/public.less';

import clearSVG from '@plone/volto/icons/delete.svg';
import { ToolbarButton } from 'volto-slate/editor/ui';
import { Transforms } from 'slate';
import { defineMessages, useIntl } from 'react-intl';
import { TABLE } from 'volto-slate/constants';

const messages = defineMessages({
  deleteTable: {
    id: 'Delete table',
    defaultMessage: 'Delete table',
  },
});

export default function install(config) {
  const { slate } = config.settings;

  slate.extensions = [...(slate.extensions || []), withTable];
  slate.elements = {
    ...slate.elements,
    ...tableElements,
  };
  slate.elementToolbarButtons[TABLE] = [
    ({ editor }) => {
      const intl = useIntl();

      return (
        <ToolbarButton
          title={intl.formatMessage(messages.deleteTable)}
          icon={clearSVG}
          aria-label={intl.formatMessage(messages.deleteTable)}
          onMouseDown={() => {
            Transforms.removeNodes(editor, {
              at: editor.selection || editor.getSavedSelection(),
              match: (n) => n.type === TABLE,
            });
          }}
        />
      );
    },
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
