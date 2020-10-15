/**
 * A small wrapper around PluginEditor. Its purpose it to allow for clearer
 * code, otherwise it would mix too many hooks and it's not possible to render
 * a variable number of hooks in a component
 */
import React from 'react';
import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';
import { useSelector, useDispatch } from 'react-redux';
import { setPluginOptions } from 'volto-slate/actions';

const SidebarEditor = (props) => {
  const { editor, pluginId, getActiveElement, pluginEditor } = props;
  const PluginEditor = pluginEditor;
  const showEditor = useSelector((state) => {
    return state['slate_plugins']?.[pluginId]?.show_sidebar_editor;
  });

  const dispatch = useDispatch();

  const active = getActiveElement(editor);

  // Hide the editor when switching to another text element
  React.useEffect(() => {
    if (!active)
      dispatch(setPluginOptions(pluginId, { show_sidebar_editor: false }));
  }, [active, dispatch, pluginId]);

  editor.isSidebarOpen = showEditor && active;

  return editor.isSidebarOpen ? (
    <SidebarPopup open={true}>
      <PluginEditor {...props} />
    </SidebarPopup>
  ) : (
    ''
  );
};

export default SidebarEditor;
