import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorReference, SlateEditor } from 'volto-slate/editor';
import { ReactEditor } from 'slate-react';

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

    this.onChange = this.onChange.bind(this);
    this.handleContainerFocus = this.handleContainerFocus.bind(this);
    this.state = { editor: null };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.isTableBlockSelected !== this.props.isTableBlockSelected &&
      this.props.cell === 0 &&
      this.props.row === 0
    ) {
      this.props.onSelectCell(this.props.row, this.props.cell);
      if (this.state.editor) {
        setTimeout(() => ReactEditor.focus(this.state.editor), 0);
      }
    }
  }

  onChange(val) {
    this.props.onChange(this.props.row, this.props.cell, [...val]);
  }

  handleContainerFocus() {
    this.props.onSelectCell(this.props.row, this.props.cell);
  }

  render() {
    return (
      __CLIENT__ && (
        <SlateEditor
          tabIndex={0}
          onChange={this.onChange}
          value={this.props.value}
          selected={this.props.selected}
          onFocus={this.handleContainerFocus}
          onClick={this.handleContainerFocus}
        >
          <EditorReference
            onHasEditor={(editor) =>
              !this.state.editor && this.setState({ editor })
            }
          />
        </SlateEditor>
      )
    );
  }
}

export default Cell;
