/**
 * This is the main toolbar button.
 */
import React from 'react';
import { useSlate } from 'slate-react';
import { useDispatch } from 'react-redux';
import { omit } from 'lodash';

import { ToolbarButton } from 'volto-slate/editor/ui';
import { hasRangeSelection } from 'volto-slate/utils';
import { setPluginOptions } from 'volto-slate/actions';

const ElementToolbarButton = (props) => {
  const { isActiveElement, insertElement, pluginId, toolbarButtonIcon } = props;
  const editor = useSlate();
  const isElement = isActiveElement(editor);
  const dispatch = useDispatch();

  const omittedProps = [
    'insertElement',
    'pluginId',
    'toolbarButtonIcon',
    'isActiveElement',
  ];

  return (
    <>
      {hasRangeSelection(editor) && (
        <ToolbarButton
          {...omit(props, ...omittedProps)}
          active={isElement}
          onMouseDown={() => {
            if (!isElement) insertElement(editor, {});
            dispatch(setPluginOptions(pluginId, { show_sidebar_editor: true }));
          }}
          icon={toolbarButtonIcon}
        />
      )}
    </>
  );
};

export default ElementToolbarButton;
