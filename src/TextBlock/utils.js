import { Editor, Transforms, Range } from 'slate';
import { plaintext_serialize } from '../editor/render';
import { LISTTYPES } from './constants';

export const blockEntryAboveSelection = (editor) => {
  // the first node entry above the selection (towards the root) that is a block
  return Editor.above(editor, {
    match: (n) => {
      console.log(n);
      return Editor.isBlock(editor, n);
    },
  });
};

export const listEntryAboveSelection = (editor) => {
  // the first node entry above the selection (towards the root) that is a list (ordered or bulleted) (a block)
  return Editor.above(editor, {
    match: (n) =>
      LISTTYPES.includes(
        typeof n.type === 'undefined' ? n.type : n.type.toString(),
      ),
  });
};

export const createEmptyParagraph = () => {
  return {
    type: 'paragraph',
    children: [{ text: '' }],
  };
};

export const createEmptyListItem = () => {
  return {
    type: 'list-item',
    children: [{ text: '' }],
  };
};

export const insertEmptyListItem = (editor) => {
  // insert a new list item at the selection
  Transforms.insertNodes(editor, createEmptyListItem());
};

export const createAndSelectNewSlateBlock = (
  value,
  index,
  { onChangeBlock, onAddBlock, onSelectBlock },
) => {
  // add a new block
  const id = onAddBlock('slate', index + 1);

  // change the new block
  const options = {
    '@type': 'slate',
    value: JSON.parse(JSON.stringify(value)),
    plaintext: plaintext_serialize(value),
  };
  onChangeBlock(id, options);
  onSelectBlock(id);
  return id;
};

export const getValueFromEditor = (editor) => {
  const nodes = Editor.fragment(editor, []);

  const value = JSON.parse(JSON.stringify(nodes || [createEmptyParagraph()]));

  return { value, nodes };
};

export const getCollapsedRangeAtBeginningOfEditor = (editor) => {
  return {
    anchor: { path: [], offset: 0 },
    focus: { path: [], offset: 0 },
  };
};

export const getCollapsedRangeAtEndOfSelection = (editor) => {
  return {
    anchor: Editor.end(editor, editor.selection),
    focus: Editor.end(editor, editor.selection),
  };
};

export const replaceAllContentInEditorWith = (editor, block) => {
  Transforms.removeNodes(editor, { at: [0] });
  Transforms.insertNodes(editor, block);
};

export const getFragmentFromStartOfSelectionToEndOfEditor = (editor) => {
  return Editor.fragment(
    editor,
    Editor.range(
      editor,
      Range.isBackward(editor.selection)
        ? editor.selection.focus
        : editor.selection.anchor,
      Editor.end(editor, []),
    ),
  );
};

export const getFragmentFromBeginningOfEditorToStartOfSelection = (editor) => {
  return Editor.fragment(
    editor,
    Editor.range(
      editor,
      [],
      Range.isBackward(editor.selection)
        ? editor.selection.focus
        : editor.selection.anchor,
    ),
  );
};

export const simulateBackspaceAtEndOfEditor = (editor) => {
  Transforms.delete(editor, {
    at: Editor.end(editor, []),
    distance: 1,
    unit: 'character',
    hanging: true,
    reverse: true,
  });
};

export const emptyListEntryAboveSelection = (editor) => {
  return (
    Editor.above(editor, {
      at: editor.selection,
      match: (x) => x.type === 'list-item',
    })[0].children[0].text === ''
  );
};

export const createDefaultFragment = () => {
  return [createEmptyParagraph()];
};

export const splitEditorInTwoFragments = (editor) => {
  let upBlock = getFragmentFromBeginningOfEditorToStartOfSelection(editor);
  let bottomBlock = getFragmentFromStartOfSelectionToEndOfEditor(editor);
  return [upBlock, bottomBlock];
};
