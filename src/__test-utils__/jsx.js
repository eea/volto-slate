// import assert from 'assert';
// import { Editor } from 'slate';
import { createHyperscript } from 'slate-hyperscript';

// const withTest = (editor) => {
//   const { isInline, isVoid } = editor;

//   editor.isInline = (element) => {
//     return element.inline === true ? true : isInline(element);
//   };

//   editor.isVoid = (element) => {
//     return element.void === true ? true : isVoid(element);
//   };

//   return editor;
// };

export const jsx = createHyperscript({
  elements: {
    block: {},
    inline: { inline: true },
  },
});
