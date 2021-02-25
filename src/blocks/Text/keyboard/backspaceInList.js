import { Transforms } from 'slate';
import config from '@plone/volto/registry';
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
  // Get the Edit component's props as received from Volto the last time it was
  // rendered.
  const props = editor.getBlockProps();
  props.onSelectBlock(newIds[0]);
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
    const { slate } = config.settings;
    const blockProps = editor.getBlockProps();
    const { data } = blockProps;

    // Can't split if block is required
    if (data?.required) return;

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
