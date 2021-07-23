import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SlateEditor } from 'volto-slate/editor';

class Cell extends Component {
  static propTypes = {
    onSelectCell: PropTypes.func.isRequired,
    row: PropTypes.number,
    cell: PropTypes.number,
    value: PropTypes.array,
    selected: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    isTableBlockSelected: PropTypes.bool,
  };

  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      selected: this.props.selected,
    };

    this.onChange = this.onChange.bind(this);
    this.handleContainerFocus = this.handleContainerFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  componentDidMount() {
    this.state.selected &&
      this.props.onSelectCell(this.props.row, this.props.cell);
  }

  handleBlur() {
    this.setState({ selected: false });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.isTableBlockSelected !== this.props.isTableBlockSelected &&
      this.props.cell === 0 &&
      this.props.row === 0
    ) {
      this.setState({ selected: this.props.selected });
    }
  }

  onChange(val) {
    this.props.onChange(this.props.row, this.props.cell, [...val]);
  }

  handleContainerFocus() {
    this.setState({ selected: true }, () => {
      this.props.onSelectCell(this.props.row, this.props.cell);
    });
  }

  render() {
    return (
      <SlateEditor
        tabIndex={0}
        onChange={this.onChange}
        value={this.props.value}
        selected={this.state.selected}
        onFocus={this.handleContainerFocus}
        onBlur={this.handleBlur}
        onClick={this.handleContainerFocus}
      />
    );
  }
}

export default Cell;
