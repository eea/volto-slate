/**
 * Edit text cell block.
 * @module volto-slate/Table/Cell
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SlateEditor from 'volto-slate/editor';
import SlateEditorContext from 'volto-slate/editor/SlateEditorContext';

/**
 * Edit text cell class.
 * @class Cell
 * @extends Component
 */
class Cell extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    onSelectCell: PropTypes.func.isRequired,
    row: PropTypes.number,
    cell: PropTypes.number,
    value: PropTypes.array,
    selected: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    isTableBlockSelected: PropTypes.bool,
  };

  /**
   * Default properties
   * @property {Object} defaultProps Default properties.
   * @static
   */
  static defaultProps = {};

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs Cell
   */
  constructor(props) {
    super(props);

    if (!__SERVER__) {
      this.state = {
        // selected: this.props.selected,
        // TODO: use utils function that creates the empty default value
        slateValue: this.props.value || [
          { type: 'p', children: [{ text: 'Replace me with a default text' }] },
        ],
        slateEditorContextData: {
          focused: false,
        },
      };
    }

    this.onChange = this.onChange.bind(this);
  }

  /**
   * Component did mount lifecycle method
   * @method componentDidMount
   * @returns {undefined}
   */
  componentDidMount() {
    // this.setState({ selected: this.props.selected }, () => {
    //   this.props.onSelectCell(this.props.row, this.props.cell);
    // });
  }

  // handleBlur() {
  //   console.log('blur', this.props.row, this.props.column);
  // }

  // handleFocus() {
  //   console.log('focus', this.props.row, this.props.column);
  // }

  /**
   * Component will receive props
   * @method componentWillReceiveProps
   * @param {Object} nextProps Next properties
   * @returns {undefined}
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
    // TODO: see the original code in Cell.jsx of Draft Tables;
    // if (
    //   nextProps.isTableBlockSelected !== this.props.isTableBlockSelected &&
    //   this.props.cell === 0 &&
    //   this.props.row === 0
    // ) {
    //   this.setState({ selected: this.props.selected });
    // }
  }

  /**
   * Change handler
   * @method onChange
   * @param {object} editorState Editor state.
   * @returns {undefined}
   */
  onChange(slateValue) {
    this.setState(
      {
        ...this.state,
        slateValue,
      },
      () => {
        this.props.onChange(this.props.row, this.props.cell, slateValue);
      },
    );
  }

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    if (__SERVER__) {
      return <div />;
    }

    return (
      <div>
        <SlateEditorContext.Provider value={this.state.slateEditorContextData}>
          <SlateEditor
            onChange={this.onChange}
            value={this.state.slateValue}
            selected={this.slateEditorContextData.focused}
          />
        </SlateEditorContext.Provider>
      </div>
    );
  }
}

export default Cell;
