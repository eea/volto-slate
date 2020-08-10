import React from 'react';
import { useSlate } from 'slate-react';
import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';

import tagSVG from '@plone/volto/icons/tag.svg';
import { ToolbarButton } from 'volto-slate/editor/ui';
import { isActiveFootnote, insertFootnote } from './utils';
import FootnoteEditor from './FootnoteEditor';

import './less/editor.less';

const FootnoteButton = () => {
  const editor = useSlate();
  const isFootnote = isActiveFootnote(editor);

  const [showEditForm, setShowEditForm] = React.useState(false);

  return (
    <>
      {showEditForm && (
        <SidebarPopup open={true}>
          <FootnoteEditor showEditor={setShowEditForm} />
        </SidebarPopup>
      )}

      <ToolbarButton
        active={isFootnote}
        onMouseDown={() => {
          if (!isActiveFootnote) insertFootnote(editor, {});
          setShowEditForm(true);
        }}
        icon={tagSVG}
      />
    </>
  );
};

export default FootnoteButton;
