import cx from 'classnames';
import { createEditor, Transforms } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import React, { useState } from 'react';
import { connect } from 'react-redux';

import { Element, Leaf } from './render';
import { SlateToolbar, PluginToolbar } from './ui';
import { settings } from '~/config';

import withTestingFeatures from './extensions/withTestingFeatures';
import { fixSelection } from 'volto-slate/utils';

// import { FootnoteToolbar } from './ui/FootnoteToolbar';

// import isHotkey from 'is-hotkey';
// import { toggleMark } from './utils';

// import FootnoteContext from './ui/FootnoteContext';
// import { updateFootnotesContextFromActiveFootnote } from './plugins/Footnote/FootnoteButton';

import './less/editor.less';

const SlateEditor = ({
  selected,
  value,
  onChange,
  placeholder,
  onKeyDown,
  properties,
  defaultSelection,
  extensions,
  renderExtensions = [],
  testingEditorRef,
  onFocus,
  onBlur,
  ...rest
}) => {
  const { slate } = settings;

  const [showToolbar, setShowToolbar] = useState(false);
  const [showPluginToolbar, setShowPluginToolbar] = useState(false);

  const defaultExtensions = slate.extensions;
  let editor = React.useMemo(() => {
    const raw = withHistory(withReact(createEditor()));
    const plugins = [...defaultExtensions, ...extensions];
    return plugins.reduce((acc, apply) => apply(acc), raw);
  }, [defaultExtensions, extensions]);

  // renderExtensions is needed because the editor is memoized, so if these
  // extensions need an updated state (for example to insert updated
  // blockProps) then we need to always wrap the editor with them
  editor = renderExtensions.reduce((acc, apply) => apply(acc), editor);

  editor.showPluginToolbar = false;

  const initial_selection = React.useRef();

  /*
   * We 'restore' the selection because we manipulate it in several cases:
   * - when blocks are artificially joined, we set the selection at junction
   * - when moving up, we set it at end of previous blok
   * - when moving down, we set it at beginning of next block
   */
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
          setTimeout(() => Transforms.select(editor, defaultSelection), 0);
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

  // const [showForm, setShowForm] = React.useState(false);
  // const [selection, setSelection] = React.useState(null);
  // const [formData, setFormData] = React.useState({});
  // const footnoteContext = React.useMemo(
  //   () => ({
  //     getShowForm: () => {
  //       return showForm || false;
  //     },
  //     getSelection: () => {
  //       return selection || null;
  //     },
  //     getFormData: () => {
  //       return formData || {};
  //     },
  //     setShowForm: (val) => {
  //       setShowForm(val);
  //     },
  //     setSelection: (val) => {
  //       console.log('save selection to', val);
  //       setSelection(val);
  //     },
  //     setFormData: (val) => {
  //       setFormData(val);
  //     },
  //   }),
  //   [showForm, selection, formData],
  // );

  // const handleChange = React.useCallback(
  //   (ev) => {
  //     // footnoteContext.setSelection(
  //     //   JSON.parse(JSON.stringify(editor.selection)),
  //     // );
  //     // TODO: somehow filter to do this only if the selection changed
  //     onChange(ev);
  //
  //     // if (footnoteContext.getShowForm()) {
  //     //   updateFootnotesContextFromActiveFootnote(editor, footnoteContext, {
  //     //     saveSelection: false,
  //     //     // clearIfNoActiveFootnote: false,
  //     //   });
  //     // }
  //   },
  //   [editor, footnoteContext, onChange],
  // );

  const pluginToolbarRef = React.useRef();
  editor.pluginToolbarRef = pluginToolbarRef;
  // editor.setShowPluginToolbar = setShowPluginToolbar;

  const [PluginToolbarChildren, setPluginToolbar] = React.useState(null);
  editor.setPluginToolbar = setPluginToolbar;
  // console.log('show', PluginToolbarChildren);

  // TODO: in Footnotes block and toolbar buttons, support Footnotes in tables
  return (
    <div
      {...rest['debug-values']} // used for `data-` HTML attributes set in the withTestingFeatures HOC
      className={cx('slate-editor', { 'show-toolbar': showToolbar, selected })}
    >
      {/* <SidebarFootnoteForm showForm={showForm} /> */}
      <Slate editor={editor} value={value || initialValue} onChange={onChange}>
        {PluginToolbarChildren && (
          <PluginToolbar selected={selected} ref={pluginToolbarRef}>
            {PluginToolbarChildren}
          </PluginToolbar>
        )}
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
          onFocus={onFocus}
          onBlur={onBlur}
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

SlateEditor.defaultProps = {
  extensions: [],
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
