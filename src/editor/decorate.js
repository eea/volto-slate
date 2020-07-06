import { Node } from 'slate';

import { settings } from '~/config';

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
