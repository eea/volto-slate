import { SHORTCUTS } from './constants';
import { toggleList } from '../../../editor/utils.js';
import { Editor, Transforms, Range } from 'slate';

export const withShortcuts = (editor) => {
  const { insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);
      const type = SHORTCUTS[beforeText];

      // TODO: do not hardcode this regex here, put it in constants.js
      if (/^[0-9]\./.test(beforeText)) {
        Transforms.select(editor, range);
        Transforms.delete(editor);
        toggleList(editor, { typeList: 'numbered-list' });
        return;
      } else if (type === 'list-item') {
        Editor.deleteBackward(editor, { unit: 'character', distance: 2 });
        toggleList(editor, { typeList: 'bulleted-list' });
        return;
      } else if (type) {
        Transforms.select(editor, range);
        Transforms.delete(editor);
        Transforms.setNodes(
          editor,
          { type },
          { match: (n) => Editor.isBlock(editor, n) },
        );
        return;
      }
    }

    insertText(text);
  };

  return editor;
};
