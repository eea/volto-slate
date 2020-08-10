import React from 'react';
import { useSlate } from 'slate-react';
import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';

import tagSVG from '@plone/volto/icons/tag.svg';
import { ToolbarButton } from 'volto-slate/editor/ui';
import { isActiveFootnote, insertFootnote } from './utils';
import FootnoteEditor from './FootnoteEditor';

import './less/editor.less';

// hack to keep a persistent state because of hack to hide toolbar because of CSS
// Should solve some other way and avoid hack
const memoryState = {};

function useMemoryState(key, initialState) {
  const [state, setState] = React.useState(() => {
    const hasMemoryValue = Object.prototype.hasOwnProperty.call(
      memoryState,
      key,
    );
    if (hasMemoryValue) {
      return memoryState[key];
    } else {
      return typeof initialState === 'function' ? initialState() : initialState;
    }
  });

  function onChange(nextState) {
    memoryState[key] = nextState;
    setState(nextState);
  }

  return [state, onChange];
}

const FootnoteButton = () => {
  const editor = useSlate();
  const isFootnote = isActiveFootnote(editor);
  // const [showEditForm, setShowEditForm] = React.useState();
  const [showEditForm, setShowEditForm] = useMemoryState('footnote');

  console.log('isFootnote', isFootnote, showEditForm);

  return (
    <>
      <ToolbarButton
        active={isFootnote}
        onMouseDown={() => {
          setShowEditForm(true);
          if (!isFootnote) insertFootnote(editor, {});
        }}
        icon={tagSVG}
      />
      {showEditForm && (
        <SidebarPopup open={true}>
          <FootnoteEditor showEditor={setShowEditForm} />
        </SidebarPopup>
      )}
    </>
  );
};

export default FootnoteButton;
