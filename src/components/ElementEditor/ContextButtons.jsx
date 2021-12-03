import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';

import clearSVG from '@plone/volto/icons/delete.svg';
import formatClearSVG from '@plone/volto/icons/format-clear.svg';

import { ToolbarButton } from 'volto-slate/editor/ui';
import { setPluginOptions } from 'volto-slate/actions';
import { Range } from 'slate';

const localMessages = defineMessages({
  clearFormatting: {
    id: 'Clear formatting',
    defaultMessage: 'Clear formatting',
  },
});

/*
 * Note: this is a weirder component, it should be called as a native function
 */
export default (options) => (editor) => {
  const {
    isActiveElement,
    unwrapElement,
    clearFormatting,
    pluginId,
    messages,
    toolbarButtonIcon,
  } = options;
  const intl = useIntl();
  const dispatch = useDispatch();
  const pid = `${editor.uid}-${pluginId}`;
  const showEditor = useSelector(
    (state) => state['slate_plugins']?.[pid]?.show_sidebar_editor,
  );

  const doClearFormatting = useCallback(() => {
    clearFormatting(editor);
  }, [clearFormatting, editor]);

  return isActiveElement(editor) ? (
    <React.Fragment key={pluginId}>
      <ToolbarButton
        title={intl.formatMessage(messages.edit)}
        icon={toolbarButtonIcon}
        active={showEditor}
        aria-label={intl.formatMessage(messages.edit)}
        onMouseDown={() => {
          dispatch(
            setPluginOptions(pid, {
              show_sidebar_editor: true,
            }),
          );
        }}
      />
      {Range.isExpanded(editor.selection || editor.getSavedSelection()) && (
        <ToolbarButton
          title={intl.formatMessage(localMessages.clearFormatting)}
          icon={formatClearSVG}
          aria-label={intl.formatMessage(localMessages.clearFormatting)}
          onMouseDown={doClearFormatting}
        />
      )}
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
