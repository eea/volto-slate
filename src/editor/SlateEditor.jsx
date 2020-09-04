import cx from 'classnames';
import { isEqual } from 'lodash';
import throttle from 'lodash/throttle';
import { createEditor, Transforms } from 'slate';
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

// import { Range } from 'slate';
// import { useIsomorphicLayoutEffect } from 'volto-slate/hooks';

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

    this.state = {
      editor: this.createEditor(),
      showToolbar: false,
      initialValue: slate.defaultValue(),
      defaultSelection: props.defaultSelection,
      // savedSelection: null,
    };
  }

  getSavedSelection() {
    // console.log('get saved', this.state.savedSelection);
    // return this.state.savedSelection;
    // console.log('get saved', this.savedSelection);
    return this.savedSelection;
  }
  setSavedSelection(selection) {
    // console.log('set saved', this.state.savedSelection);
    // this.setState({ savedSelection: selection });
    // console.log('set saved', this.savedSelection);
    this.savedSelection = selection;
  }

  createEditor() {
    const { slate } = settings;
    const defaultExtensions = slate.extensions;
    const raw = withHistory(withReact(createEditor()));
    const { renderExtensions = [] } = this.props;
    const plugins = [
      ...defaultExtensions,
      ...this.props.extensions,
      ...renderExtensions,
    ];
    const editor = plugins.reduce((acc, apply) => apply(acc), raw);

    console.log('renderext', renderExtensions);
    console.log('editor', editor);

    // renderExtensions is needed because the editor is memoized, so if these
    // extensions need an updated state (for example to insert updated
    // blockProps) then we need to always wrap the editor with them
    // const editor = this.props.renderExtensions.reduce(
    //   (acc, apply) => apply(acc),
    //   this.state.editor,
    // );

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

    throttle(() => {
      setTimeout(() => {
        console.log('save');
        this.setSavedSelection(editor.selection);
        this.setState({ update: true }); // just a dummy thing to trigger re-render
        // this.setState({ savedSelection: editor.selection });
      }, 110);
    }, 110)();

    // debugger;
    // ReactEditor.focus(editor);
    // const sel = window.getSelection();
    // console.log('on dom', this.state.editor.selection);
    // if (sel.type === 'None') return;
    // if (!editor.selection) {
    //   const s = ReactEditor.toSlateRange(editor, sel);
    //   console.log('dom dom', this.props.block, s);
    // }
    // There's a 100ms delay in processing of dom selection events in Slate
    // fixSelection(editor, evt);
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

    if (this.props.selected) {
      if (!ReactEditor.isFocused(this.state.editor)) {
        console.log('focusing');
        ReactEditor.focus(this.state.editor);
      }
    }

    if (this.props.onUpdate) {
      this.props.onUpdate(this.state.editor);
    }
  }

  render() {
    const editor = this.state.editor;
    const {
      selected,
      value,
      placeholder,
      onFocus,
      onBlur,
      onKeyDown,
      testingEditorRef,
    } = this.props;
    const { slate } = settings;

    if (testingEditorRef) {
      testingEditorRef.current = editor;
    }

    // console.log('rerender');
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
              return <Helper key={i} />;
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

export default connect((state, props) => {})(
  __CLIENT__ && window?.Cypress
    ? withTestingFeatures(SlateEditor)
    : SlateEditor,
);
