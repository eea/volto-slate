import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl'; // , defineMessages

import clearSVG from '@plone/volto/icons/delete.svg';

import { ToolbarButton } from 'volto-slate/editor/ui';
import { setPluginOptions } from 'volto-slate/actions';
import { Range } from 'slate';

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
      {Range.isExpanded(editor.selection) && (
        <ToolbarButton
          title="Clear formatting"
          icon={clearSVG}
          aria-label="Clear formatting"
          alt="Clear formatting"
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
