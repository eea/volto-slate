import { Transforms, Editor } from 'slate';
import { settings } from '~/config';
import {
  isCursorInList,
  isCursorAtListBlockStart,
  deconstructToVoltoBlocks,
} from 'volto-slate/utils';

/**
 * Handle the new Volto blocks created by `deconstructToVoltoBlocks`.
 * @param {Editor} editor The Slate editor object as customized by the
 * volto-slate addon.
 * @param {string[]} newIds The IDs of the newly created Volto blocks.
 */
const handleNewVoltoBlocks = (editor, newIds) => {
  // TODO: (done?) rewrite to benefit from FormContext and Form promises

  // Get the Edit component's props as received from Volto the last time it was
  // rendered.
  const props = editor.getBlockProps();
  // Unfortunately, until Volto's on* methods don't have Promise support, we
  // have to use a setTimeout with a bigger value, to be able to properly select
  // the proper block
  setTimeout(() => {
    props.onSelectBlock(newIds[0]);
  }, 100);
};

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

    // Convert all the selection to be of type `slate.defaultBlockType` (by
    // default 'p' or paragraph).
    Transforms.setNodes(editor, { type: slate.defaultBlockType });

    deconstructToVoltoBlocks(editor).then((newIds) => {
      handleNewVoltoBlocks(editor, newIds);
    });
    return true;
  }
}
