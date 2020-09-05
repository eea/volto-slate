/**
 * This is the main toolbar button.
 */
import React from 'react';
import { useSlate } from 'slate-react';
import { useDispatch } from 'react-redux';

import { ToolbarButton } from 'volto-slate/editor/ui';
import { hasRangeSelection } from 'volto-slate/utils';
import { setPluginOptions } from 'volto-slate/actions';

const ElementToolbarButton = (props) => {
  const { isActiveElement, insertElement, pluginId, toolbarButtonIcon } = props;
  const editor = useSlate();
  const isElement = isActiveElement(editor);
  const dispatch = useDispatch();

  return (
    <>
      {hasRangeSelection(editor) && (
        <ToolbarButton
          {...props}
          active={isElement}
          onMouseDown={() => {
            dispatch(
              setPluginOptions(pluginId, { show_sidebar_editor: false }),
            );
            if (!isElement) insertElement(editor, {});
          }}
          icon={toolbarButtonIcon}
        />
      )}
    </>
  );
};

export default ElementToolbarButton;
