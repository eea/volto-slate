import React from 'react';
import { useSlate } from 'slate-react';
import { Editor, Transforms } from 'slate';

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

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  return !!match;
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

export const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  // Transforms.unwrapNodes(editor, {
  //   match: (n) => LIST_TYPES.includes(n.type),
  //   split: true,
  // });
  //
  const isListItem = isBlockActive(editor, 'list-item');
  if (isListItem) {
    Transforms.setNodes(editor, {
      type: format,
    });

    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === 'list-item',
    });

    if (!match) {
      const block = { type: 'list-item', children: [] };
      Transforms.wrapNodes(editor, block);
    }
  } else {
    // if list-items are never "active", as list-item is not a format
    const type = isActive ? 'paragraph' : isList ? 'list-item' : format;
    Transforms.setNodes(editor, {
      type,
    });
  }

  //
  // if (!isActive && isList) {
  //   const block = { type: format, children: [] };
  //   Transforms.wrapNodes(editor, block);
  // }
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();

  // const isActive = !!getActiveEntry(editor, format);
  const isActive = isBlockActive(editor, format);

  const handleMouseDown = React.useCallback(
    (event) => {
      event.preventDefault();
      toggleBlock(editor, format);
      // newToggleBlock(editor, format, isActive);
      // if (!isActive) {
      //   toggleBlock(editor, format, false);
      // }
    },
    [editor, format], // , isActive
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
