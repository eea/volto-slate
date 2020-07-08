import { Editor, Transforms } from 'slate';
import { settings } from '~/config';

export function blockEntryAboveSelection(editor) {
  // the first node entry above the selection (towards the root) that is a block
  return Editor.above(editor, {
    match: (n) => {
      console.log(n);
      return Editor.isBlock(editor, n);
    },
  });
}

export function toggleBlock(editor, format, justSelection) {
  const { slate } = settings;
  const applyOnRange = () => {
    return justSelection && editor.selection
      ? editor.selection
      : getMaxRange(editor);
  };

  const entry = getActiveEntry(editor, format);
  let activeNodePath;
  if (entry) {
    [, activeNodePath] = entry;
  }

  const unwrappableBlockTypes = [
    'block-quote',
    'heading-two',
    'heading-three',
    ...slate.listTypes,
  ];

  if (unwrappableBlockTypes.includes(format)) {
    console.log('entry', entry);
    // TODO: ! code flow enters here, prints 'entry', but...
    if (entry) {
      // does not enter here, although entry is a truish value (an array with 2 non-null, defined elements)
      console.log('is active, entry exists... unwrapping...');

      Transforms.unwrapNodes(editor, {
        at: activeNodePath,
        split: true,
        mode: 'all',
      });
    } else {
      console.log('is not active, wrapping...');

      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block, {
        at: applyOnRange(),
      });
    }
  } else {
    // inlines and marks
    Transforms.setNodes(
      editor,
      {
        type: entry ? 'paragraph' : format,
      },
      { at: applyOnRange() },
    );
  }
}
