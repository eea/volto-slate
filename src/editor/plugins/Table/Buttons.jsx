import { defineMessages, useIntl } from 'react-intl';
import { Transforms } from 'slate';
import { TABLE } from 'volto-slate/constants';
import { ToolbarButton } from 'volto-slate/editor/ui';

import {
  addColAfter,
  addColBefore,
  addRowAfter,
  addRowBefore,
  deleteCol,
  deleteRow,
} from './utils';

import clearSVG from '@plone/volto/icons/delete.svg';
import colAfterSVG from '@plone/volto/icons/column-after.svg';
import colBeforeSVG from '@plone/volto/icons/column-before.svg';
import colDeleteSVG from '@plone/volto/icons/column-delete.svg';
import rowAfterSVG from '@plone/volto/icons/row-after.svg';
import rowBeforeSVG from '@plone/volto/icons/row-before.svg';
import rowDeleteSVG from '@plone/volto/icons/row-delete.svg';

const messages = defineMessages({
  deleteTable: {
    id: 'Delete table',
    defaultMessage: 'Delete table',
  },
  insertRowBefore: {
    id: 'Insert row before',
    defaultMessage: 'Insert row before',
  },
  insertRowAfter: {
    id: 'Insert row after',
    defaultMessage: 'Insert row after',
  },
  deleteRow: {
    id: 'Delete row',
    defaultMessage: 'Delete row',
  },
  insertColBefore: {
    id: 'Insert col before',
    defaultMessage: 'Insert col before',
  },
  insertColAfter: {
    id: 'Insert col after',
    defaultMessage: 'Insert col after',
  },
  deleteCol: {
    id: 'Delete col',
    defaultMessage: 'Delete col',
  },
});

export const DeleteTable = ({ editor }) => {
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
};

export const InsertRowBefore = ({ editor }) => {
  const intl = useIntl();

  return (
    <ToolbarButton
      title={intl.formatMessage(messages.insertRowBefore)}
      icon={rowBeforeSVG}
      aria-label={intl.formatMessage(messages.insertRowBefore)}
      onMouseDown={() => {
        addRowBefore(editor);
      }}
    />
  );
};

export const InsertRowAfter = ({ editor }) => {
  const intl = useIntl();

  return (
    <ToolbarButton
      title={intl.formatMessage(messages.insertRowAfter)}
      icon={rowAfterSVG}
      aria-label={intl.formatMessage(messages.insertRowAfter)}
      onMouseDown={() => {
        addRowAfter(editor, { header: false });
      }}
    />
  );
};

export const DeleteRow = ({ editor }) => {
  const intl = useIntl();

  return (
    <ToolbarButton
      title={intl.formatMessage(messages.deleteRow)}
      icon={rowDeleteSVG}
      aria-label={intl.formatMessage(messages.deleteRow)}
      onMouseDown={() => {
        deleteRow(editor);
      }}
    />
  );
};

export const InsertColBefore = ({ editor }) => {
  const intl = useIntl();

  return (
    <ToolbarButton
      title={intl.formatMessage(messages.insertColBefore)}
      icon={colBeforeSVG}
      aria-label={intl.formatMessage(messages.insertColBefore)}
      onMouseDown={() => {
        addColBefore(editor);
      }}
    />
  );
};

export const InsertColAfter = ({ editor }) => {
  const intl = useIntl();

  return (
    <ToolbarButton
      title={intl.formatMessage(messages.insertColAfter)}
      icon={colAfterSVG}
      aria-label={intl.formatMessage(messages.insertColAfter)}
      onMouseDown={() => {
        addColAfter(editor);
      }}
    />
  );
};

export const DeleteCol = ({ editor }) => {
  const intl = useIntl();

  return (
    <ToolbarButton
      title={intl.formatMessage(messages.deleteCol)}
      icon={colDeleteSVG}
      aria-label={intl.formatMessage(messages.deleteCol)}
      onMouseDown={() => {
        deleteCol(editor);
      }}
    />
  );
};
