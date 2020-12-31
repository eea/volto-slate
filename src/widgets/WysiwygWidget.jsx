/**
 * WysiwygWidget container.
 * @module volto-slate/widgets/WysiwygWidget
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import { FormFieldWrapper } from '@plone/volto/components';

import SlateEditor from '../editor/SlateEditor';
import { serializeNodesToHtml } from '../editor/render';
import { normalizeBlockNodes } from 'volto-slate/utils';
import { deserialize } from 'volto-slate/editor/deserialize';
import { Editor } from 'slate';
import { htmlTagsToSlate } from 'volto-slate/editor/config';

import './style.css';

/**
 * WysiwygWidget container class.
 * @class WysiwygWidget
 * @extends Component
 */
class WysiwygWidget extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    /**
     * Id of the field
     */
    id: PropTypes.string.isRequired,
    /**
     * Value of the field
     */
    value: PropTypes.shape({
      /**
       * Content type of the value
       */
      'content-type': PropTypes.string,
      /**
       * Data of the value
       */
      data: PropTypes.string,
      /**
       * Encoding of the value
       */
      encoding: PropTypes.string,
    }),
    /**
     * On change handler
     */
    onChange: PropTypes.func,
  };

  /**
   * Default properties
   * @property {Object} defaultProps Default properties.
   * @static
   */
  static defaultProps = {
    value: {
      'content-type': 'text/html',
      data: '',
      encoding: 'utf8',
    },
    onChange: null,
  };

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs WysiwygWidget
   */
  constructor(props) {
    super(props);

    this.state = {
      selected: this.props.focus,
      value: null,
    };

    this.editorRef = React.createRef(null);
  }

  /**
   * Change handler
   * @method onChange
   * @returns {undefined}
   */
  onChange = (data) => {
    this.setState(
      (state, props) => {
        return { ...state, value: data };
      },
      () => {
        this.props.onChange(this.props.id, {
          data: serializeNodesToHtml(data),
        });
      },
    );
  };

  convertHTMLToNodes = (editor, html) => {
    return new Promise((resolve, reject) => {
      let rr = null;
      let nodes = [];
      this.setState(
        (state, props) => {
          if (rr !== null) {
            resolve([]);
            return state;
          }

          rr = Editor.rangeRef(editor, editor.selection, {
            affinity: 'forward',
          });

          const parsed = new DOMParser().parseFromString(html, 'text/html');

          let fragment = deserialize(editor, parsed.body);
          fragment = Array.isArray(fragment) ? fragment : [fragment];
          nodes = normalizeBlockNodes(editor, fragment);

          return { ...state, value: nodes };
        },
        () => {
          if (rr === null) {
            resolve([]);
            return;
          }
          // TODO: pt should be obtained from the rr above and passed to Transforms.select
          // call commented below.
          const pt = /* rr?.current || Editor.start(editor) ||  */ {};
          pt.anchor = { path: [0, 0], offset: 0 };
          pt.focus = { path: [0, 0], offset: 0 };
          // Transforms.select(editor, /* html.length === 0 ?  */pt/*  : rr.current */);
          rr.unref();
          rr = null;
          resolve(nodes);
        },
      );
    });
  };

  componentDidUpdate(prevProps) {
    const editor = this.editorRef.current;
    if (
      this.props.value.data !== prevProps.value.data &&
      !this.firstRenderWithEditorRef
    ) {
      this.convertHTMLToNodes(editor, this.props.value.data).then(() => {});
    }
  }

  componentDidMount() {
    if (this.editorRef.current) {
      this.editorRef.current.htmlTagsToSlate = htmlTagsToSlate;
    }
    this.convertHTMLToNodes(this.editorRef.current, this.props.value.data).then(
      (nodes) => {
        this.setState((state, props) => {
          return { ...state, value: nodes };
        });
      },
    );
  }

  firstRenderWithEditorRef = true;

  /**
   * Render method.
   * @method render
   * @returns {React.ReactElement} Markup for the component.
   */
  render() {
    const { id, className, properties, placeholder } = this.props;

    const withBlockProperties = (editor) => {
      editor.getBlockProps = () => this.props;
      return editor;
    };

    if (
      this.firstRenderWithEditorRef &&
      (__SERVER__ ? false : this.editorRef.current)
    ) {
      this.firstRenderWithEditorRef = false;
      this.convertHTMLToNodes(
        this.editorRef.current,
        this.props.value.data,
      ).then((nodes) => {
        this.setState((state, props) => {
          return { ...state, value: nodes };
        });
      });
    }

    return (
      <FormFieldWrapper
        {...this.props}
        draggable={false}
        className="slate_wysiwyg"
      >
        <div
          style={{ boxSizing: 'initial' }}
          role="textbox"
          tabIndex="-1"
          onClick={() => {
            this.setState({ selected: true });
          }}
          className="slate_wysiwyg_box"
          onKeyDown={() => {}}
        >
          <SlateEditor
            id={id}
            className={className}
            name={id}
            value={this.state.value}
            block={`block-${id}`}
            renderExtensions={[withBlockProperties]}
            selected={this.state.selected}
            properties={properties}
            placeholder={placeholder}
            testingEditorRef={this.editorRef}
            onChange={this.onChange}
          />
        </div>
      </FormFieldWrapper>
    );
  }
}

export default injectIntl(WysiwygWidget);
