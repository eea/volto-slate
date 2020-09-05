/**
 * A small wrapper around FootnoteEditor. Its purpose it to allow for clearer
 * code, otherwise it would mix too many hooks and it's not possible to render
 * a variable number of hooks in a component
 */
import React from 'react';
import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';
import { useSelector, useDispatch } from 'react-redux';
import FootnoteEditor from './FootnoteEditor';
import { getActiveFootnote } from './utils';
import { FOOTNOTE_EDITOR } from './constants';

const SidebarEditor = (props) => {
  const { editor } = props;
  const showEditor = useSelector((state) => state['footnote_editor']?.show);
  const dispatch = useDispatch();

  const active = getActiveFootnote(editor);

  // Hide the editor when switching to another text element
  React.useEffect(() => {
    if (!active) dispatch({ type: FOOTNOTE_EDITOR, show: false });
  }, [active, dispatch]);

  return showEditor && active ? (
    <SidebarPopup open={true}>
      <FootnoteEditor editor={editor} />
    </SidebarPopup>
  ) : (
    ''
  );
};

export default SidebarEditor;
