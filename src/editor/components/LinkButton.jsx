import React from 'react';
import { useSlate } from 'slate-react';
import { Editor, Transforms, Range } from 'slate';
import Button from './Button';

const LINK = 'link';

const isLinkActive = editor => {
  const [link] = Editor.nodes(editor, { match: n => n.type === LINK });
  return !!link;
};

const unwrapLink = editor => {
  Transforms.unwrapNodes(editor, { match: n => n.type === LINK });
};

const wrapLink = (editor, url) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: LINK,
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

const insertLink = (editor, url) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};

const LinkButton = () => {
  const editor = useSlate();
  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={event => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        insertLink(editor, url);
      }}
    >
      Link
    </Button>
  );
};
export default LinkButton;
