import React from 'react';
import { useSlate } from 'slate-react';
import { Transforms } from 'slate';

import {
  getActiveEntry,
  isBlockActive,
  LIST_TYPES,
  // toggleBlock,
  // toggleList,
  // convertAllToParagraph,
} from 'volto-slate/utils';
import ToolbarButton from './ToolbarButton';

// const newToggleBlock = (editor, format, isActive) => {
//   switch (format) {
//     case 'bulleted-list':
//     case 'numbered-list':
//       toggleList(editor, {
//         typeList: format,
//         isBulletedActive: !!getActiveEntry(editor, 'bulleted-list'),
//         isNumberedActive: !!getActiveEntry(editor, 'numbered-list'),
//       });
//       break;
//     case 'block-quote':
//     case 'heading-two':
//     case 'heading-three':
//     default:
//       convertAllToParagraph(editor);
//       if (!isActive) {
//         toggleBlock(editor, format, false);
//       }
//       break;
//   }
// };

export const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => LIST_TYPES.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();

  const isActive = !!getActiveEntry(editor, format);

  const handleMouseDown = React.useCallback(
    (event) => {
      event.preventDefault();
      toggleBlock(editor, format);
      // newToggleBlock(editor, format, isActive);
      // if (!isActive) {
      //   toggleBlock(editor, format, false);
      // }
    },
    [editor, format, isActive],
  );

  return (
    <ToolbarButton
      active={isActive}
      onMouseDown={handleMouseDown}
      icon={icon}
    />
  );
};

export default BlockButton;
