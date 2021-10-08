import React from 'react'; // , useState
import SlateToolbar from './SlateToolbar';
import SlateContextToolbar from './SlateContextToolbar';
import config from '@plone/volto/registry';
import { hasRangeSelection } from 'volto-slate/utils';
import { ReactEditor } from 'slate-react';

/**
 * The main Slate toolbar. All the others are just wrappers, UI or used here
 */
const InlineToolbar = (props) => {
  const {
    editor,
    className,
    showExpandedToolbar,
    setShowExpandedToolbar,
  } = props;

  const { slate } = config.settings;
  const [showMainToolbar, setShowMainToolbar] = React.useState(
    !!(editor.selection && hasRangeSelection(editor)),
  );

  React.useEffect(() => {
    const el = ReactEditor.toDOMNode(editor, editor);
    const toggleToolbar = () => {
      const selection = window.getSelection();
      const { activeElement } = window.document;
      if (activeElement !== el) return;
      if (!selection.isCollapsed && !showMainToolbar) {
        setShowMainToolbar(true);
      } else if (selection.isCollapsed && showMainToolbar) {
        setShowMainToolbar(false);
      }
    };
    window.document.addEventListener('selectionchange', toggleToolbar);
    return () => document.removeEventListener('selectionchange', toggleToolbar);
  }, [editor, showMainToolbar]);

  return (
    <>
      <SlateToolbar
        className={className}
        selected={true}
        enableExpando={slate.enableExpandedToolbar}
        showExpandedToolbar={showExpandedToolbar}
        setShowExpandedToolbar={setShowExpandedToolbar}
        show={showMainToolbar}
      />
      <SlateContextToolbar
        editor={editor}
        plugins={slate.contextToolbarButtons}
      />
    </>
  );
};

export default InlineToolbar;
