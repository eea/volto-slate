import React, { useMemo } from 'react';

import SlateEditor from './../editor';
import { getDOMSelectionInfo } from './../editor/utils';
import { plaintext_serialize } from './../editor/render';
import { settings } from '~/config';

const TextBlockEdit = (props) => {
  const { data, selected, block, onChangeBlock } = props;
  const { value } = data;

  const keyDownHandlers = useMemo(() => {
    return {
      ArrowUp: ({ editor, event, selection }) => {},

      ArrowDown: ({ editor, event, selection }) => {},

      Backspace: ({ editor, event, selection, onDeleteBlock, id, data }) => {
        const { start, end } = selection;
        const { value } = data;

        if (start === end && start === 0) {
          if (plaintext_serialize(value || []).length === 0) {
            event.preventDefault();
            return onDeleteBlock(id, true);
          }
        }
        return false;
      },

      ...settings.slate?.keyDownHandlers,
    };
  }, []);

  return (
    <SlateEditor
      value={value}
      data={data}
      block={block}
      onChange={(value) => {
        onChangeBlock(block, {
          ...data,
          value,
          plaintext: plaintext_serialize(value || []),
        });
      }}
      onKeyDown={(editor, event) => {
        return keyDownHandlers[event.key]
          ? keyDownHandlers[event.key]({
              ...props,
              editor,
              event,
              selection: getDOMSelectionInfo(),
            })
          : null;
      }}
      selected={selected}
      placeholder="Enter some rich text…"
    />
  );
};

export default TextBlockEdit;

// TODO: what if the cursor is on the first line, not on the first char?
// const selectionState = this.state.editorState.getSelection();
// const currentCursorPosition = selectionState.getStartOffset();
// if (selection.currentCursorPosition === 0) {
//   // TODO: where do I get the `node` from?
//   //onFocusPreviousBlock(block, node);
//
//   event.preventDefault();
//   return;
// }
// TODO: translate this Draft.js code to Slate.js code:
// const selectionState = this.state.editorState.getSelection();
// const { editorState } = this.state;
// const currentCursorPosition = selectionState.getStartOffset();
// const blockLength = editorState
//   .getCurrentContent()
//   .getFirstBlock()
//   .getLength();
// if (currentCursorPosition === blockLength) {
//   this.props.onFocusNextBlock(this.props.block, this.node);
// }
// event.preventDefault();
// return;
// import { Icon, BlockChooser } from '@plone/volto/components';
// import { plaintext_serialize } from '../../editor/render';
//
// import { Button } from 'semantic-ui-react';
// import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
//
// import addSVG from '@plone/volto/icons/circle-plus.svg';
// See https://docs.voltocms.com/blocks/anatomy/
//

//
// if (typeof onFirstPositionBackspace === 'function') {
//   if (event.key === 'Backspace' && start === end && start === 0) {
//     event.preventDefault();
//     onFirstPositionBackspace();
//     return;
//   }
// }

// const toggleAddNewBlock = () => setAddNewBlockOpened(!addNewBlockOpened);
//
// const handleClickOutside = (e) => {
//   if (outerDivRef.current && doesNodeContainClick(outerDivRef.current, e))
//     return;
//   setAddNewBlockOpened(false);
// };
//

// {!detached && plaintext_serialize(value || initialValue).length === 0 && (
//   <Button
//     basic
//     icon
//     onClick={toggleAddNewBlock}
//     className="block-add-button"
//   >
//     <Icon name={addSVG} className="block-add-button" size="24px" />
//   </Button>
// )}
// {addNewBlockOpened && (
//   <BlockChooser onMutateBlock={onMutateBlock} currentBlock={block} />
// )}
// const [addNewBlockOpened, setAddNewBlockOpened] = useState(false);
// document.addEventListener('mousedown', handleClickOutside, false);
// TODO: replace: UNSAFE_componentWillReceiveProps(nextProps)
// return function () {
//   document.removeEventListener('mousedown', handleClickOutside, false);
// };
//
//
// console.log('editor', editor);
// console.log('arrowup');
//
// // editor.deselect();
//
// if (window.getSelection) {
//   if (window.getSelection().empty) {
//     // Chrome
//     window.getSelection().empty();
//   } else if (window.getSelection().removeAllRanges) {
//     // Firefox
//     window.getSelection().removeAllRanges();
//   }
// } else if (document.selection) {
//   // IE?
//   document.selection.empty();
// }
// onFocusPreviousBlock(block, blockNode.current);
// editor.deselect();
// if (window.getSelection) {
//   if (window.getSelection().empty) {
//     // Chrome
//     window.getSelection().empty();
//   } else if (window.getSelection().removeAllRanges) {
//     // Firefox
//     window.getSelection().removeAllRanges();
//   }
// } else if (document.selection) {
//   // IE?
//   document.selection.empty();
// }
//
// console.log('arrowdown', editor, event, selection);
// const { currentCursorPosition, start, end } = selection;
// if (currentCursorPosition === start && start === end) {
//   onFocusNextBlock(block, blockNode.current);
// }
// event.preventDefault();
//
// // TODO: do this only if the cursor is on the last displayed line
// // (it can be one big paragraph with many displayed lines):
//
// console.log('ArrowDown props', props);
// onFocusNextBlock(block, blockNode.current);
