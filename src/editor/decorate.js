import { Node } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';

import { settings } from '~/config';

export const HighlightByType = ([node, path], ranges) => {
  const editor = useSlate();
  const { slate } = settings;
  const { nodeTypesToHighlight } = slate;

  if (nodeTypesToHighlight.includes(node.type)) {
    const [found] = Node.texts(editor, { from: path, to: path });
    const visualSelectionRanges = HighlightSelection(found, ranges);
    const text = Node.string(node) || '';
    const range = {
      anchor: { path, offset: 0 },
      focus: { path, offset: text.length },
      highlight: true,
      highlightType: visualSelectionRanges.length === 0 ? node.type : null,
      isSelection: visualSelectionRanges.length > 0,
    };
    return [range];
  }

  return ranges;
};

/**
 * HighlightSelection.
 *
 * A runtime decorator that decorates the saved selection, when the editor is
 * is no longer active
 *
 * @param {}
 * @param {} ranges
 */
export function HighlightSelection([node, path], ranges) {
  const editor = useSlate();

  let selected = ReactEditor.isFocused(editor);

  // Compatibility with Volto blocks
  if (editor.getBlockProps) {
    const blockProps = editor.getBlockProps();
    selected = blockProps.selected;
  }

  if (selected && !editor.selection && editor.savedSelection) {
    const newSelection = editor.savedSelection;
    if (JSON.stringify(path) === JSON.stringify(newSelection.anchor.path)) {
      const range = {
        ...newSelection,
        highlight: true,
        isSelection: true,
      };
      ranges.push(range);
    }
  }
  return ranges;
}
