import React from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { ToolbarButton } from 'volto-slate/editor/ui';
import { isActiveLink, unwrapLink } from './utils';

import { LINK_EDITOR } from './constants';
import { useDispatch, useSelector } from 'react-redux';

import editingSVG from '@plone/volto/icons/editing.svg';
import clearSVG from '@plone/volto/icons/delete.svg';

const messages = defineMessages({
  edit: {
    id: 'Edit link',
    defaultMessage: 'Edit link',
  },
  delete: {
    id: 'Delete link',
    defaultMessage: 'Delete link',
  },
});

export default (editor) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const showEditor = useSelector((state) => state['link_editor']?.show);

  return isActiveLink(editor) ? (
    <React.Fragment key="link">
      <ToolbarButton
        icon={editingSVG}
        active={showEditor}
        title={intl.formatMessage(messages.edit)}
        aria-label={intl.formatMessage(messages.edit)}
        alt={intl.formatMessage(messages.edit)}
        onMouseDown={() => {
          dispatch({ type: LINK_EDITOR, show: true });
        }}
      />
      <ToolbarButton
        icon={clearSVG}
        title={intl.formatMessage(messages.delete)}
        aria-label={intl.formatMessage(messages.delete)}
        alt={intl.formatMessage(messages.delete)}
        onMouseDown={() => {
          unwrapLink(editor);
        }}
      />
    </React.Fragment>
  ) : (
    ''
  );
};
