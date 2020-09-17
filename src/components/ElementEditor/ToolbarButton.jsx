/**
 * This is the main toolbar button.
 */
import React from 'react';
import { useSlate } from 'slate-react';
import { useDispatch } from 'react-redux';

import { ToolbarButton } from 'volto-slate/editor/ui';
import { hasRangeSelection } from 'volto-slate/utils';
import { setPluginOptions } from 'volto-slate/actions';
import { useFormStateContext } from '@plone/volto/components/manage/Form/FormContext';

const ElementToolbarButton = (props) => {
  const { isActiveElement, insertElement, pluginId, toolbarButtonIcon } = props;
  const editor = useSlate();
  const isElement = isActiveElement(editor);
  const dispatch = useDispatch();
  const formContext = useFormStateContext();

  return (
    <>
      {hasRangeSelection(editor) && (
        <ToolbarButton
          {...props}
          active={isElement}
          onMouseDown={() => {
            if (!isElement) insertElement(editor, formContext, {});
            dispatch(setPluginOptions(pluginId, { show_sidebar_editor: true }));
          }}
          icon={toolbarButtonIcon}
        />
      )}
    </>
  );
};

export default ElementToolbarButton;
