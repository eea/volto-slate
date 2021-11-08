import cx from 'classnames';
import { isEqual } from 'lodash';
import { Node, Transforms } from 'slate'; // , Transforms
import { Slate, Editable, ReactEditor } from 'slate-react';
import React, { Component } from 'react'; // , useState
import { connect } from 'react-redux';
import { v4 as uuid } from 'uuid';

import config from '@plone/volto/registry';

import { Element, Leaf } from './render';

import withTestingFeatures from './extensions/withTestingFeatures';
import { makeEditor, toggleInlineFormat, toggleMark } from 'volto-slate/utils';
import { InlineToolbar } from './ui';
import EditorContext from './EditorContext';

import isHotkey from 'is-hotkey';

import './less/editor.less';

const handleHotKeys = (editor, event, config) => {
  let wasHotkey = false;

  for (const hk of Object.entries(config.hotkeys)) {
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

  return wasHotkey;
};

// TODO: implement onFocus
class SlateEditor extends Component {
  constructor(props) {
    super(props);

    this.createEditor = this.createEditor.bind(this);
    this.multiDecorator = this.multiDecorator.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getSavedSelection = this.getSavedSelection.bind(this);
    this.setSavedSelection = this.setSavedSelection.bind(this);

    this.savedSelection = null;

    const uid = uuid();

    this.state = {
      editor: this.createEditor(uid),
      showExpandedToolbar: config.settings.slate.showExpandedToolbar,
      uid,
    };

    this.editor = null;
    this.selectionTimeout = null;
  }

  getSavedSelection() {
    return this.savedSelection;
  }
  setSavedSelection(selection) {
    this.savedSelection = selection;
  }

  createEditor(uid) {
    const editor = makeEditor({ extensions: this.props.extensions });

    // When the editor loses focus it no longer has a valid selections. This
    // makes it impossible to have complex types of interactions (like filling
    // in another text box, operating a select menu, etc). For this reason we
    // save the active selection

    editor.getSavedSelection = this.getSavedSelection;
    editor.setSavedSelection = this.setSavedSelection;
    editor.uid = uid || this.state.uid;

    return editor;
  }

  handleChange(value) {
    if (this.props.onChange && !isEqual(value, this.props.value)) {
      this.props.onChange(value, this.editor);
    }
  }

  multiDecorator([node, path]) {
    // Decorations (such as higlighting node types, selection, etc).
    const { runtimeDecorators = [] } = config.settings.slate;
    return runtimeDecorators.reduce(
      (acc, deco) => deco(this.state.editor, [node, path], acc),
      [],
    );
  }

  componentDidMount() {
    // watch the dom change

    if (this.props.selected) {
      let focused = true;
      try {
        focused = ReactEditor.isFocused(this.state.editor);
      } catch {}
      if (!focused) {
        setTimeout(() => {
          try {
            ReactEditor.focus(this.state.editor);
          } catch {}
        }, 100); // flush
      }
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.extensions, this.props.extensions)) {
      this.setState({ editor: this.createEditor() });
      return;
    }

    const { editor } = this.state;

    if (!prevProps.selected && this.props.selected) {
      if (!ReactEditor.isFocused(this.state.editor)) {
        //  || !editor.selection
        setTimeout(() => {
          if (window.getSelection().type === 'None') {
            const match = Node.first(this.state.editor, []);
            const path = match[1];
            const point = { path, offset: 0 };
            const selection = { anchor: point, focus: point };
            Transforms.select(this.state.editor, selection);
          }

          ReactEditor.focus(this.state.editor);
        }, 100); // flush
      }
    }

    // if (this.props.selected && this.editor && this.editor.selection) {
    //   this.editor.setSavedSelection(this.editor.selection);

    if (this.props.selected && this.props.onUpdate) {
      this.props.onUpdate(editor);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { selected = true, value, readOnly } = nextProps;
    const res =
      selected ||
      this.props.selected !== selected ||
      this.props.readOnly !== readOnly ||
      !isEqual(value, this.props.value);
    return res;
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
    const { slate } = config.settings;

    // renderExtensions is needed because the editor is memoized, so if these
    // extensions need an updated state (for example to insert updated
    // blockProps) then we need to always wrap the editor with them
    const editor = renderExtensions.reduce(
      (acc, apply) => apply(acc),
      this.state.editor,
    );
    this.editor = editor;

    if (testingEditorRef) {
      testingEditorRef.current = editor;
    }

    // debug-values are `data-` HTML attributes in withTestingFeatures HOC

    return (
      <div
        {...this.props['debug-values']}
        className={cx('slate-editor', {
          'show-toolbar': this.state.showExpandedToolbar,
          selected,
        })}
        tabIndex={-1}
      >
        <EditorContext.Provider value={editor}>
          <Slate
            editor={editor}
            value={value || slate.defaultValue()}
            onChange={this.handleChange}
          >
            {selected ? (
              <InlineToolbar editor={editor} className={className} />
            ) : (
              ''
            )}
            <Editable
              tabIndex={this.props.tabIndex || 0}
              readOnly={readOnly}
              placeholder={placeholder}
              renderElement={(props) => <Element {...props} />}
              renderLeaf={(props) => <Leaf {...props} />}
              decorate={this.multiDecorator}
              spellCheck={false}
              onBlur={() => {
                this.props.onBlur && this.props.onBlur();
                return null;
              }}
              onClick={this.props.onClick}
              onSelect={(e) => {
                if (!selected && this.props.onFocus) {
                  // we can't overwrite the onFocus of Editable, as the onFocus
                  // in Slate has too much builtin behaviour that's not
                  // accessible otherwise. Instead we try to detect such an
                  // event based on observing selected state
                  if (!editor.selection) setTimeout(this.props.onFocus, 100);
                }

                if (this.selectionTimeout) clearTimeout(this.selectionTimeout);
                this.selectionTimeout = setTimeout(() => {
                  if (
                    editor.selection &&
                    !isEqual(editor.selection, this.savedSelection) &&
                    !this.isUnmounted
                  ) {
                    this.setState((state) => ({ update: !this.state.update }));
                    this.setSavedSelection(
                      JSON.parse(JSON.stringify(editor.selection)),
                    );
                  }
                }, 200);
              }}
              onKeyDown={(event) => {
                const handled = handleHotKeys(editor, event, slate);
                if (handled) return;
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
                <li> {selected ? 'selected' : 'notselected'}</li>
                <li>
                  {ReactEditor.isFocused(editor) ? 'focused' : 'unfocused'}
                </li>
              </ul>
            ) : (
              ''
            )}
            {this.props.children}
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

export default connect((state, props) => {
  return {};
})(
  __CLIENT__ && window?.Cypress
    ? withTestingFeatures(SlateEditor)
    : SlateEditor,
);
