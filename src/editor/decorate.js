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

export function HighlightSelection([node, path], ranges) {
  const editor = useSlate();
  const blockProps = editor.getBlockProps();
  const { selected } = blockProps;
  // console.log(selected, editor.selection, editor.savedSelection);
  if (selected && !editor.selection && editor.savedSelection) {
    const newSelection = JSON.parse(editor.savedSelection);
    console.log(
      path,
      newSelection.anchor.path,
      path === newSelection.anchor.path,
    );
    if (path === newSelection.anchor.path) {
      const range = {
        ...newSelection,
        highlight: true,
        highlightType: 'selection',
      };
      ranges.push(range);
      console.log(node, path);
      console.log('pushed', range);
    }
  }
  return ranges;
}
