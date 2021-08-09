import { Node } from 'slate';
import {
  _unwrapElement,
  _getActiveElement,
} from 'volto-slate/components/ElementEditor/utils';

const getActiveElement = _getActiveElement('zotero');
const unwrapElement = _unwrapElement('zotero');

/**
 * Handles the Backspace key press event in the given `editor`.
 * @param {Editor} editor
 * @param {Event} event
 */
export function unwrapEmptyString({ editor }) {
  const actEl = getActiveElement(editor);

  if (actEl && Node.string(actEl[0]).length === 1) {
    unwrapElement(editor);
  }
}
