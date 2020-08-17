import { Transforms } from 'slate';
import { settings } from '~/config';
import {
  isCursorInList,
  isCursorAtListBlockStart,
  deconstructToVoltoBlocks,
} from 'volto-slate/utils';

/**
 * Handles the Backspace key press event in the given `editor`.
 *
 * @param {Editor} editor
 * @param {Event} event
 */
export function backspaceInList({ editor, event }) {
  // If the cursor is not in a list, nothing special.
  if (!isCursorInList(editor)) return false;

  // If the cursor is at list block start, do something different:
  if (isCursorAtListBlockStart(editor)) {
    const { slate } = settings;

    // Raise all LI-s as direct children of the editor.
    Transforms.liftNodes(editor, {
      match: (n) => n.type === slate.listItemType,
    });

    // Convert all the selection to be of type `slate.defaultBlockType` (by default 'p' or paragraph).
    Transforms.setNodes(editor, { type: slate.defaultBlockType });

    console.log('backspace deconstruct');
    // TODO: (done?) rewrite to benefit from FormContext and Form promises
    deconstructToVoltoBlocks(editor).then(() => {
      // Get the Edit component's props as received from Volto the last time it was rendered.
      const props = editor.getBlockProps();
      // Unfortunately, until Volto's on* methods don't have Promise support,
      // we have to use a setTimeout with a bigger value, to be able to
      // properly select the proper block
      setTimeout(() => {
        /*
         * Seems to not work well in this situation, even though I set the timeout to 1000ms:
         *
         * 3 items in a single list, the cursor at the start of the second item, press Enter, then at the start of the same item, now shown as the first item in the second list, press Backspace, then we have 3 separate blocks, the first one is a list w/ one item, the second is simple text, the third one is a list w/ one item, but the focus is lost! If I set the timeout to 1000ms the loss of focus happens later so I think that the props.id parameter below is the problem.
         */
        props.onSelectBlock(props.id);
      }, 100);
    });
    return true;
  }
}
