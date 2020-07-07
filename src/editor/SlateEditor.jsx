import isHotkey from 'is-hotkey';
import cx from 'classnames';
import { createEditor, Transforms } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import React, { useState } from 'react';
import { connect } from 'react-redux';

import { Element, Leaf } from './render';
import { SlateToolbar } from './ui';
import { settings } from '~/config';

import withTestingFeatures from './extensions/withTestingFeatures';
import { fixSelection } from 'volto-slate/utils';
// import { toggleMark } from './utils';

import './less/editor.less';

class SlateEditorComponent extends React.Component {
  constructor(props) {
    super(props);

    const { slate } = settings;
    const initialValue = slate.defaultValue();

    this.createEditor = this.createEditor.bind(this);
    this.mixEditor = this.mixEditor.bind(this);

    this.state = {
      showToolbar: false,
      editor: this.createEditor(),
      initialValue,
    };
  }

  createEditor() {
    const { slate } = settings;
    const defaultExtensions = slate.extensions;
    const raw = withHistory(withReact(createEditor()));
    const editor = defaultExtensions.reduce((acc, apply) => apply(acc), raw);

    console.log('created editor');
    return editor;
  }

  mixEditor(raw) {
    // const { slate } = settings;
    // const plugins = [
    //   // TODO: this needs cleanup
    //   // FIXME: commented out for testing reasons:
    //   // withDelete,
    //   // withBreakEmptyReset, // don't "clean" this up, it needs to stay here!
    //   ...extensions,
    //   // ...defaultExtensions,
    // ];
    const { extensions = [] } = this.props;
    const editor = extensions.reduce((acc, apply) => apply(acc), raw);
    return editor;
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.selected && this.props.selected) {
      ReactEditor.focus(this.state.editor);
      // This makes the Backspace key work properly in block.
      // Don't remove it, unless this test passes:
      // - with the Slate block unselected, click in the block.
      // - Hit backspace. If it deletes, then the test passes
      fixSelection(this.state.editor);
    }
    // if (prevProps.extensions !== this.props.extensions) {
    //   // console.log(this.createEditor());
    //   this.setState({ editor: this.createEditor() });
    // }
  }

  componentDidMount() {}

  render() {
    const { showToolbar, editor, initialValue } = this.state;
    const { selected, value, onChange, placeholder, onKeyDown } = this.props;

    const mixedEditor = this.mixEditor(editor);

    // decorate={multiDecorate}

    return (
      <div
        className={cx('slate-editor', {
          'show-toolbar': showToolbar,
          selected,
        })}
      >
        <Slate
          editor={mixedEditor}
          value={value || initialValue}
          onChange={onChange}
        >
          <SlateToolbar
            selected={selected}
            showToolbar={showToolbar}
            setShowToolbar={(showToolbar) => this.setState({ showToolbar })}
          />
          <Editable
            readOnly={!selected}
            placeholder={placeholder}
            renderElement={Element}
            renderLeaf={Leaf}
            onKeyDown={(event) => {
              // let wasHotkey = false;
              //
              // for (const hotkey in slate.hotkeys) {
              //   if (isHotkey(hotkey, event)) {
              //     event.preventDefault();
              //     const mark = slate.hotkeys[hotkey];
              //     toggleMark(editor, mark);
              //     wasHotkey = true;
              //   }
              // }
              //
              // if (wasHotkey) {
              //   return;
              // }
              onKeyDown && onKeyDown({ editor: mixedEditor, event });
            }}
          />
        </Slate>
      </div>
    );
  }
}

// export default connect((state, props) => {
//   const blockId = props.block;
//   return {
//     defaultSelection: state.slate_block_selections?.[blockId],
//   };
// })(
//   __CLIENT__ && window?.Cypress
//     ? withTestingFeatures(SlateEditorComponent)
//     : SlateEditorComponent,
// );

const SlateEditor = ({
  selected,
  value,
  onChange,
  placeholder,
  onKeyDown,
  properties,
  defaultSelection,
  extensions,
  testingEditorRef,
  ...props
}) => {
  const { slate } = settings;

  const [showToolbar, setShowToolbar] = useState(false);

  const defaultExtensions = slate.extensions;
  let editor = React.useMemo(() => {
    const raw = withHistory(withReact(createEditor()));

    // TODO: this needs cleanup
    const plugins = [
      // FIXME: commented out for testing reasons:
      // withDelete,
      // withBreakEmptyReset, // don't "clean" this up, it needs to stay here!
      ...defaultExtensions,
    ];
    return plugins.reduce((acc, apply) => apply(acc), raw);
  }, [defaultExtensions]);

  editor = extensions.reduce((acc, apply) => apply(acc), editor);

  const initial_selection = React.useRef();

  // Handles the case when block was just joined with backspace, in that
  // case we want to restore the cursor close to the initial position
  React.useLayoutEffect(() => {
    if (selected) {
      ReactEditor.focus(editor);

      // This makes the Backspace key work properly in block.
      // Don't remove it, unless this test passes:
      // - with the Slate block unselected, click in the block.
      // - Hit backspace. If it deletes, then the test passes

      fixSelection(editor);

      if (defaultSelection) {
        if (initial_selection.current !== defaultSelection) {
          initial_selection.current = defaultSelection;
          Transforms.select(editor, defaultSelection);
        }
        return () => ReactEditor.blur(editor);
      }
    }
    return () => ReactEditor.blur(editor);
  }, [editor, selected, defaultSelection]);

  const initialValue = slate.defaultValue();

  const { runtimeDecorators = [] } = slate;

  const multiDecorate = React.useCallback(
    ([node, path]) => {
      return runtimeDecorators.reduce(
        (acc, deco) => deco([node, path], acc),
        [],
      );
    },
    [runtimeDecorators],
  );

  if (testingEditorRef) {
    testingEditorRef.current = editor;
  }

  return (
    <div
      className={cx('slate-editor', { 'show-toolbar': showToolbar, selected })}
    >
      <Slate editor={editor} value={value || initialValue} onChange={onChange}>
        <SlateToolbar
          selected={selected}
          showToolbar={showToolbar}
          setShowToolbar={setShowToolbar}
        />
        <Editable
          readOnly={!selected}
          placeholder={placeholder}
          renderElement={Element}
          renderLeaf={Leaf}
          decorate={multiDecorate}
          onKeyDown={(event) => {
            // let wasHotkey = false;
            //
            // for (const hotkey in slate.hotkeys) {
            //   if (isHotkey(hotkey, event)) {
            //     event.preventDefault();
            //     const mark = slate.hotkeys[hotkey];
            //     toggleMark(editor, mark);
            //     wasHotkey = true;
            //   }
            // }
            //
            // if (wasHotkey) {
            //   return;
            // }

            onKeyDown && onKeyDown({ editor, event });
          }}
        />
      </Slate>
    </div>
  );
};

export default connect((state, props) => {
  const blockId = props.block;
  return {
    defaultSelection: state.slate_block_selections?.[blockId],
  };
})(
  __CLIENT__ && window?.Cypress
    ? withTestingFeatures(SlateEditor)
    : SlateEditor,
);
