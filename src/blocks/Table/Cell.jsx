/**
 * Edit text cell block.
 * @module volto-slate/Table/Cell
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SlateEditor from 'volto-slate/editor';

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

    this.state = {
      selected: this.props.selected,
    };
    // if (!__SERVER__) {
    // }
  }

  /**
   * Component did mount lifecycle method
   * @method componentDidMount
   * @returns {undefined}
   */
  componentDidMount() {
    this.state.selected &&
      this.props.onSelectCell(this.props.row, this.props.cell);
  }

  handleBlur() {
    this.setState({ selected: false });
  }

  handleFocus() {
    this.setState({ selected: true }, () => {
      this.props.onSelectCell(this.props.row, this.props.cell);
    });
  }

  /**
   * Component will receive props
   * @method componentWillReceiveProps
   * @param {Object} nextProps Next properties
   * @returns {undefined}
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.isTableBlockSelected !== this.props.isTableBlockSelected &&
      this.props.cell === 0 &&
      this.props.row === 0
    ) {
      this.setState({ selected: this.props.selected });
    }
  }

  /**
   * Change handler
   * @method onChange
   * @param {array} val Current value in the Slate editor.
   * @returns {undefined}
   */
  onChange(val) {
    this.props.onChange(this.props.row, this.props.cell, [...val]);
  }

  handleContainerFocus() {
    this.setState({ selected: true }, () => {
      this.props.onSelectCell(this.props.row, this.props.cell);
    });
  }

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    // if (__SERVER__) {
    //   return <div />;
    // }

    // TODO: Tab works well to go through cells in the table, but Shift-Tab does nothing
    return (
      // The tabIndex is required for the keyboard navigation
      /* eslint-disable jsx-a11y/no-noninteractive-tabindex */
      <div onFocus={this.handleContainerFocus.bind(this)} tabIndex={0}>
        <SlateEditor
          onChange={this.onChange.bind(this)}
          value={this.props.value}
          selected={this.state.selected}
          onFocus={this.handleFocus.bind(this)}
          onBlur={this.handleBlur.bind(this)}
        />
      </div>
    );
  }
}

export default Cell;
