import {
  getFragmentFromBeginningOfEditorToStartOfSelection,
  getFragmentFromStartOfSelectionToEndOfEditor,
} from './selection';

/*
 * Gets two fragments: left, right: before selection, after selection
 */
export function splitEditorInTwoFragments(editor) {
  let left = getFragmentFromBeginningOfEditorToStartOfSelection(editor);
  let right = getFragmentFromStartOfSelectionToEndOfEditor(editor);
  return [left, right];
}
