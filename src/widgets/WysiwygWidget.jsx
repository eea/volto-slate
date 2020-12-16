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
import { htmlTagsToSlate } from 'volto-slate/editor/config';
import { deserialize } from 'volto-slate/editor/deserialize';
import { Transforms, Editor } from 'slate';

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
     * Title of the field
     */
    title: PropTypes.string.isRequired,
    /**
     * Description of the field
     */
    description: PropTypes.string,
    /**
     * True if field is required
     */
    required: PropTypes.bool,
    /**
     * Value of the field
     */
    value: PropTypes.shape({
      /**
       * Content type of the value
       */
      // 'content-type': PropTypes.string,
      /**
       * Data of the value
       */
      data: PropTypes.string,
      /**
       * Encoding of the value
       */
      // encoding: PropTypes.string,
    }),
    /**
     * List of error messages
     */
    error: PropTypes.arrayOf(PropTypes.string),
    /**
     * On change handler
     */
    onChange: PropTypes.func,
    /**
     * On delete handler
     */
    onDelete: PropTypes.func,
    /**
     * On edit handler
     */
    onEdit: PropTypes.func,
    /**
     * Wrapped form component
     */
    wrapped: PropTypes.bool,
  };

  /**
   * Default properties
   * @property {Object} defaultProps Default properties.
   * @static
   */
  static defaultProps = {
    description: null,
    required: false,
    value: {
      'content-type': 'text/html',
      data: '',
      encoding: 'utf8',
    },
    error: [],
    onEdit: null,
    onDelete: null,
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
      value: [{ type: 'p', children: [{ text: 'Dummy initial text' }] }],
    };

    this.editorRef = React.createRef(null);
  }

  /**
   * Change handler
   * @method onChange
   * @returns {undefined}
   */
  onChange = (data) => {
    this.props.onChange(this.props.id, { data: serializeNodesToHtml(data) });
  };

  componentDidUpdate(prevProps) {
    // console.log('old', prevProps.value.data, 'new', this.props.value.data);
    if (this.props.value.data !== prevProps.value.data) {
      let rr = null;
      try {
        this.setState(
          (state, props) => {
            if (rr !== null) {
              return state;
            }
            rr = Editor.rangeRef(
              this.editorRef.current,
              this.editorRef.current.selection,
              { affinity: 'backward' },
            );
            // console.log('rr.current before', rr.current);

            const parsed = new DOMParser().parseFromString(
              props.value.data,
              'text/html',
            );

            // TODO: maybe these isInline, isVoid are not enough:
            const editor = {
              htmlTagsToSlate,
              isInline: (n) => Editor.isInline(this.editorRef.current, n),
              isVoid: (n) => Editor.isVoid(this.editorRef.current, n),
            };

            let fragment = deserialize(editor, parsed.body);
            fragment = Array.isArray(fragment) ? fragment : [fragment];
            const nodes = normalizeBlockNodes(editor, fragment);

            // setTimeout(() => {
            //   this.setState({value: nodes});
            // }, 100);
            return { ...state, value: nodes };

            // return state;
          },
          () => {
            if (rr === null) {
              return;
            }
            try {
              // console.log('rr.current', rr.current);
              Transforms.select(this.editorRef.current, rr.current);
              rr.unref();
            } catch (ex) {}
            rr = null;
          },
        );
      } catch (ex) {}
    }
  }

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

    if (__SERVER__) {
      // TODO: fill this if statement with something useful if the SlateEditor
      // component used below is not enough for good SSR
      //
      // return ...
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
            properties={/* {} */ properties}
            placeholder={/* '' */ placeholder}
            testingEditorRef={this.editorRef}
            onChange={this.onChange}
          />
        </div>
      </FormFieldWrapper>
    );
  }
}

export default injectIntl(WysiwygWidget);
