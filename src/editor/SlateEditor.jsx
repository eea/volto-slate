import cx from 'classnames';
import { isEqual } from 'lodash';
// import throttle from 'lodash/throttle';
import { createEditor } from 'slate'; // , Transforms
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import React, { Component } from 'react'; // , useState
import { connect } from 'react-redux';

import { Element, Leaf } from './render';
import { SlateToolbar, SlateContextToolbar } from './ui';
import { settings } from '~/config';

import withTestingFeatures from './extensions/withTestingFeatures';
import { hasRangeSelection } from 'volto-slate/utils'; // fixSelection,

import isHotkey from 'is-hotkey';
import { toggleMark } from 'volto-slate/utils';

import './less/editor.less';

const DEBUG = true;

class SlateEditor extends Component {
  constructor(props) {
    super(props);

    this.createEditor = this.createEditor.bind(this);
    this.multiDecorator = this.multiDecorator.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getSavedSelection = this.getSavedSelection.bind(this);
    this.setSavedSelection = this.setSavedSelection.bind(this);
    this.onDOMSelectionChange = this.onDOMSelectionChange.bind(this);

    const { slate } = settings;

    this.savedSelection = null;
    this.mouseDown = null;

    this.state = {
      editor: this.createEditor(),
      showToolbar: false,
      initialValue: slate.defaultValue(),
      defaultSelection: props.defaultSelection,
      // savedSelection: null,
    };
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
    Object.defineProperty(editor, 'savedSelection', {
      get: this.getSavedSelection,
      set: this.setSavedSelection,
    });

    return editor;
  }

  handleChange(value) {
    if (!isEqual(value, this.props.value)) {
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

    this.setSavedSelection(editor.selection);
    if (!this.mouseDown) {
      console.log('update');
      this.setState({ update: true }); // just a dummy thing to trigger re-render
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
        console.log('focusing mount');
        ReactEditor.focus(this.state.editor);
      }
    }
  }

  componentWillUnmount() {
    window.document.removeEventListener(
      'selectionchange',
      this.onDOMSelectionChange,
    );
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.extensions, this.props.extensions)) {
      this.setState({ editor: this.createEditor() });
      return;
    }

    if (!prevProps.selected && this.props.selected) {
      if (!ReactEditor.isFocused(this.state.editor)) {
        ReactEditor.focus(this.state.editor);
      }
    }

    if (this.props.onUpdate) {
      this.props.onUpdate(this.state.editor);
    }
  }

  render() {
    const {
      selected,
      value,
      placeholder,
      // onFocus,
      // onBlur,
      onKeyDown,
      testingEditorRef,
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

    if (testingEditorRef) {
      testingEditorRef.current = editor;
    }

    return (
      <div
        {...this.props['debug-values']} // used for `data-` HTML attributes set in the withTestingFeatures HOC
        className={cx('slate-editor', {
          'show-toolbar': this.state.showToolbar,
          selected,
        })}
      >
        <Slate
          editor={editor}
          value={value || this.state.initialValue}
          onChange={this.handleChange}
        >
          {selected ? (
            hasRangeSelection(editor) ? (
              <SlateToolbar
                selected={selected}
                showToolbar={this.showToolbar}
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
            readOnly={false}
            placeholder={placeholder}
            renderElement={(props) => <Element {...props} />}
            renderLeaf={(props) => <Leaf {...props} />}
            decorate={this.multiDecorator}
            spellCheck={false}
            onClick={() => {
              this.setState({ update: true }); // just a dummy thing to trigger re-render
            }}
            onBlur={() => {
              console.log('blur', JSON.stringify(editor.selection));
            }}
            onMouseDown={() => {
              this.mouseDown = true;
            }}
            onMouseUp={() => {
              this.mouseDown = false;
            }}
            onKeyDown={(event) => {
              let wasHotkey = false;

              for (const hotkey in slate.hotkeys) {
                if (isHotkey(hotkey, event)) {
                  event.preventDefault();
                  const mark = slate.hotkeys[hotkey];
                  toggleMark(editor, mark);
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
          {DEBUG ? (
            <ul>
              <li>{selected ? 'selected' : 'no-selected'}</li>
              <li>
                defaultSelection: {JSON.stringify(this.props.defaultSelection)}
              </li>
              <li>savedSelection: {JSON.stringify(editor.savedSelection)}</li>
              <li>live selection: {JSON.stringify(editor.selection)}</li>
              <li>children: {JSON.stringify(editor.children)}</li>
            </ul>
          ) : (
            ''
          )}
        </Slate>
      </div>
    );
  }
}

SlateEditor.defaultProps = {
  extensions: [],
};

export default connect((state, props) => {
  return {};
})(
  __CLIENT__ && window?.Cypress
    ? withTestingFeatures(SlateEditor)
    : SlateEditor,
);
