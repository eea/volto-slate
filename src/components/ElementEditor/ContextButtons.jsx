import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl'; // , defineMessages

import editingSVG from '@plone/volto/icons/tag.svg';
import clearSVG from '@plone/volto/icons/delete.svg';

import { ToolbarButton } from 'volto-slate/editor/ui';
import { SLATE_PLUGINS } from 'volto-slate/constants';

/*
 * Note: this is a weirder component, it should be called as a native function
 */
export default (options) => (editor) => {
  const { isActiveElement, unwrapElement, pluginId, messages } = options;
  const intl = useIntl();
  const dispatch = useDispatch();
  const showEditor = useSelector(
    (state) => state['slate_plugins']?.[pluginId]?.show_sidebar_editor,
  );

  return isActiveElement(editor) ? (
    <React.Fragment key={pluginId}>
      <ToolbarButton
        title={intl.formatMessage(messages.edit)}
        icon={editingSVG}
        active={showEditor}
        aria-label={intl.formatMessage(messages.edit)}
        onMouseDown={() => {
          dispatch({
            type: SLATE_PLUGINS,
            [pluginId]: { show_sidebar_editor: true },
          });
        }}
      />
      <ToolbarButton
        title={intl.formatMessage(messages.delete)}
        icon={clearSVG}
        aria-label={intl.formatMessage(messages.delete)}
        alt={intl.formatMessage(messages.delete)}
        onMouseDown={() => {
          unwrapElement(editor);
        }}
      />
    </React.Fragment>
  ) : (
    ''
  );
};
