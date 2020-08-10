import { Node } from 'slate';

import { settings } from '~/config';
import { useSlate } from 'slate-react';

export const highlightByType = ([node, path], ranges) => {
  const { slate } = settings;
  const { nodeTypesToHighlight } = slate;

  if (nodeTypesToHighlight.includes(node.type)) {
    const text = Node.string(node) || '';
    ranges.push({
      anchor: { path, offset: 0 },
      focus: { path, offset: text.length },
      highlight: true,
      highlightType: node.type,
    });
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

  if (!editor.getBlockProps) return ranges;
  const blockProps = editor.getBlockProps();

  // This is a hack, selected exists only in Volto blocks
  // TODO: make it right
  const { selected } = blockProps;
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
