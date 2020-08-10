import React from 'react';
import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';
import { useSelector } from 'react-redux';
import FootnoteEditor from './FootnoteEditor';
import { getActiveFootnote } from './utils';
import { useSlate } from 'slate-react';

const SidebarEditor = (props) => {
  const showEditor = useSelector((state) => state['footnote_editor']?.show);
  const editor = useSlate();

  const active = getActiveFootnote(editor);
  return showEditor && active ? (
    <SidebarPopup open={true}>
      <FootnoteEditor />
    </SidebarPopup>
  ) : (
    ''
  );
};

export default SidebarEditor;
