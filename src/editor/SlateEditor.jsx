import cx from 'classnames';
import { isEqual } from 'lodash';
import { createEditor } from 'slate'; // , Transforms
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import React, { Component } from 'react'; // , useState
import { connect } from 'react-redux';

import { Element, Leaf } from './render';
import { SlateToolbar, SlateContextToolbar } from './ui';
import { settings } from '~/config';

import withTestingFeatures from './extensions/withTestingFeatures';
import {
  hasRangeSelection,
  toggleInlineFormat,
  toggleMark,
} from 'volto-slate/utils'; // fixSelection,
import EditorContext from './EditorContext';

import isHotkey from 'is-hotkey';

import './less/editor.less';

const handleEditorRef = (editor, ref) => {
  if (typeof ref === 'function') {
    ref(editor);
  } else if (typeof ref === 'object') {
    ref.current = editor;
  }

  // TODO: solve issue: the following console.log prints 'undefined' in Jest
  // unit tests (maybe the issue isrelated to JSDOM) and in the browser, without
  // any changes it prints 'object'
  console.log('typeof editor.htmlTagsToSlate', typeof editor.htmlTagsToSlate);

  return editor;
};

class SlateEditor extends Component {
  constructor(props) {
    super(props);

    this.createEditor = this.createEditor.bind(this);
    this.multiDecorator = this.multiDecorator.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getSavedSelection = this.getSavedSelection.bind(this);
    this.setSavedSelection = this.setSavedSelection.bind(this);
    this.onDOMSelectionChange = this.onDOMSelectionChange.bind(this);

    this.savedSelection = null;
    this.mouseDown = null;

    const editor = handleEditorRef(
      this.createEditor(),
      this.props.testingEditorRef,
    );

    this.state = {
      editor,
      showToolbar: false,
    };

    this.editor = null;
  }

  getSavedSelection() {
    return this.savedSelection;
  }
  setSavedSelection(selection) {
    this.savedSelection = selection;
  }

  createEditor() {
    const { slate } = settings;
    const defaultExtensions = slate.extensions;
    const raw = withHistory(withReact(createEditor()));

    const plugins = [...defaultExtensions, ...this.props.extensions];
    const editor = plugins.reduce((acc, apply) => apply(acc), raw);

    // When the editor loses focus it no longer has a valid selections. This
    // makes it impossible to have complex types of interactions (like filling
    // in another text box, operating a select menu, etc). For this reason we
    // save the active selection

    editor.getSavedSelection = this.getSavedSelection;
    editor.setSavedSelection = this.setSavedSelection;

    return editor;
  }

  handleChange(value) {
    if (this.props.onChange && !isEqual(value, this.props.value)) {
      this.props.onChange(value);
    }
  }

  multiDecorator([node, path]) {
    // Decorations (such as higlighting node types, selection, etc).
    const { runtimeDecorators = [] } = settings.slate;
    return runtimeDecorators.reduce(
      (acc, deco) => deco(this.state.editor, [node, path], acc),
      [],
    );
  }

  onDOMSelectionChange(evt) {
    const { activeElement } = window.document;
    const { editor } = this.state;

    const el = ReactEditor.toDOMNode(editor, editor);
    if (activeElement !== el) return;

    if (editor.selection)
      this.setSavedSelection(JSON.parse(JSON.stringify(editor.selection)));

    if (!this.mouseDown) {
      // Having this makes the toolbar more responsive to selection changes
      // made via regular text editing (shift+arrow keys)
      // this.setState({ update: true }); // needed, triggers re-render
      // A better solution would be to improve performance of the toolbar
      // editor
    }
  }

  componentDidMount() {
    // watch the dom change
    window.document.addEventListener(
      'selectionchange',
      this.onDOMSelectionChange,
    );

    if (this.props.selected) {
      if (!ReactEditor.isFocused(this.state.editor)) {
        setTimeout(() => ReactEditor.focus(this.state.editor), 10); // flush
      }
    }
  }

  componentWillUnmount() {
    window.document.removeEventListener(
      'selectionchange',
      this.onDOMSelectionChange,
    );
    handleEditorRef(null, this.props.testingEditorRef);
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.extensions, this.props.extensions)) {
      this.setState({
        editor: handleEditorRef(
          this.createEditor(),
          this.props.testingEditorRef,
        ),
      });
      return;
    }

    if (!prevProps.selected && this.props.selected) {
      if (!ReactEditor.isFocused(this.state.editor)) {
        setTimeout(() => ReactEditor.focus(this.state.editor), 10); // flush
      }
    }

    if (this.editor && this.editor.selection) {
      this.editor.setSavedSelection(this.editor.selection);
    }

    if (this.props.onUpdate) {
      this.props.onUpdate(this.state.editor);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { selected = true, value, readOnly } = nextProps;
    return (
      selected ||
      this.props.selected !== selected ||
      this.props.readOnly !== readOnly ||
      !isEqual(value, this.props.value)
    );
  }

  render() {
    const {
      selected,
      value,
      placeholder,
      onKeyDown,
      testingEditorRef,
      readOnly,
      className,
      renderExtensions = [],
    } = this.props;
    const { slate } = settings;

    // renderExtensions is needed because the editor is memoized, so if these
    // extensions need an updated state (for example to insert updated
    // blockProps) then we need to always wrap the editor with them
    const editor = renderExtensions.reduce(
      (acc, apply) => apply(acc),
      this.state.editor,
    );

    this.editor = handleEditorRef(editor, testingEditorRef);

    // debug-values are `data-` HTML attributes in withTestingFeatures HOC

    return (
      <div
        {...this.props['debug-values']}
        className={cx('slate-editor', {
          'show-toolbar': this.state.showToolbar,
          selected,
        })}
      >
        <EditorContext.Provider value={editor}>
          <Slate
            editor={editor}
            value={value || slate.defaultValue()}
            onChange={this.handleChange}
          >
            {selected ? (
              hasRangeSelection(editor) ? (
                <SlateToolbar
                  className={className}
                  selected={selected}
                  showToolbar={this.state.showToolbar}
                  setShowToolbar={(value) =>
                    this.setState({ showToolbar: value })
                  }
                />
              ) : (
                <SlateContextToolbar
                  editor={editor}
                  plugins={slate.contextToolbarButtons}
                />
              )
            ) : (
              ''
            )}
            <Editable
              readOnly={readOnly}
              placeholder={placeholder}
              renderElement={(props) => <Element {...props} />}
              renderLeaf={(props) => <Leaf {...props} />}
              decorate={this.multiDecorator}
              spellCheck={false}
              onClick={() => {
                this.setState({ update: true }); // needed, triggers re-render
              }}
              onMouseDown={() => {
                this.mouseDown = true;
              }}
              onMouseUp={() => {
                this.mouseDown = false;
              }}
              onKeyDown={(event) => {
                let wasHotkey = false;

                for (const hk of Object.entries(slate.hotkeys)) {
                  const [shortcut, { format, type }] = hk;
                  if (isHotkey(shortcut, event)) {
                    event.preventDefault();

                    if (type === 'inline') {
                      toggleInlineFormat(editor, format);
                    } else {
                      // type === 'mark'
                      toggleMark(editor, format);
                    }

                    wasHotkey = true;
                  }
                }

                if (wasHotkey) {
                  return;
                }

                onKeyDown && onKeyDown({ editor, event });
              }}
            />
            {selected &&
              slate.persistentHelpers.map((Helper, i) => {
                return <Helper key={i} editor={editor} />;
              })}
            {this.props.debug ? (
              <ul>
                <li>{selected ? 'selected' : 'no-selected'}</li>
                <li>
                  savedSelection: {JSON.stringify(editor.getSavedSelection())}
                </li>
                <li>live selection: {JSON.stringify(editor.selection)}</li>
                <li>children: {JSON.stringify(editor.children)}</li>
              </ul>
            ) : (
              ''
            )}
          </Slate>
        </EditorContext.Provider>
      </div>
    );
  }
}

SlateEditor.defaultProps = {
  extensions: [],
  className: '',
};

// console.log('SUPER OBJECT', {
//   __JEST__,
//   'g J': global.__JEST__,
//   'w J': window.__JEST__,
//   // __SERVER__,
//   'g S': global.__SERVER__,
//   'w S': window._SERVER__,
//   // __CLIENT__,
//   'g C': global.__CLIENT__,
//   'w C': window.__CLIENT__,
//   global,
//   // __SERVER__:        RefernceError: __SERVER__ is not defined
//   // the same with __CLIENT__
// });

// SUPER OBJECT {
//       __JEST__: true,
//       'g J': true,
//       'w J': true,
//       'g S': undefined,
//       'w S': undefined,
//       'g C': true,
//       'w C': true,
//       global: Window {

// console.log('ABC', (__CLIENT__ && window?.Cypress) || __JEST__);

export default connect((state, props) => {
  return {};
})(
  // Cypress || Jest (most probably JSDOM) environment
  (__CLIENT__ && window?.Cypress) || global.__JEST__
    ? withTestingFeatures(SlateEditor)
    : SlateEditor,
);
