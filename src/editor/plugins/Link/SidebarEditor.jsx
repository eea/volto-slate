import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSlate } from 'slate-react';

import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';
import LinkEditor from './LinkEditor';

import { getActiveLink } from './utils';
import { LINK_EDITOR } from './constants';

const SidebarEditor = (props) => {
  const showEditor = useSelector((state) => state['link_editor']?.show);
  const editor = useSlate();
  const dispatch = useDispatch();

  const active = getActiveLink(editor);

  React.useEffect(() => {
    if (!active) dispatch({ type: LINK_EDITOR, show: false });
  }, [active, dispatch]);

  return showEditor && active ? (
    <SidebarPopup open={true}>
      <LinkEditor />
    </SidebarPopup>
  ) : (
    ''
  );
};

export default SidebarEditor;
