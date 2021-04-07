/**
 * Slate Table block editor.
 * @module volto-slate/blocks/Table/Edit
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { map, remove } from 'lodash';
import { Button, Segment, Table, Form } from 'semantic-ui-react';
import { Portal } from 'react-portal';
import cx from 'classnames';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';

import Cell from './Cell';
import { Field, Icon } from '@plone/volto/components';

import rowSVG from '@plone/volto/icons/row.svg';
import colSVG from '@plone/volto/icons/column.svg';
import deleteSVG from '@plone/volto/icons/delete.svg';

/**
 * Returns a random string of 32 digits.
 */
const getId = () => Math.floor(Math.random() * Math.pow(2, 24)).toString(32);

/**
 * @returns {object} An empty Slate paragraph (a simple Slate block node with
 * type set to "p" and a `Text` child with an empty string).
 */
function getEmptyParagraph() {
  return [{ type: 'p', children: [{ text: '' }] }];
}

/**
 * @param {string} type The type of the newly created cell: either 'header' or
 * 'data', by default it is 'data'.
 * @returns {object} A new cell object containing three properties: `key`,
 * `type` and `value`.
 */
const emptyCell = (type = 'data') => ({
  key: getId(),
  type: type,
  value: getEmptyParagraph(),
});

/**
 * @param {Array[object]} cells Array of placeholders, each of them will be
 * replaced in the newly created row with an empty cell. (Practically, just the
 * length of the array matters.)
 * @returns {object} A new row object containing the keys `key` and `cells`.
 */
const emptyRow = (cells) => ({
  key: getId(),
  cells: map(cells, () => emptyCell()),
});

/**
 * The initial value for the displayed table's data. The IDs of the rows and
 * cells are computed here only once, so each new table has the same IDs
 * initially, but this does not have bad consequences since the key has
 * relevance only in the context in which it is used.
 */
const initialTable = {
  fixed: true,
  compact: false,
  basic: false,
  celled: true,
  inverted: false,
  striped: false,
  rows: [
    {
      key: getId(),
      cells: [
        {
          key: getId(),
          type: 'header',
          value: getEmptyParagraph(),
        },
        {
          key: getId(),
          type: 'header',
          value: getEmptyParagraph(),
        },
      ],
    },
    {
      key: getId(),
      cells: [
        {
          key: getId(),
          type: 'data',
          value: getEmptyParagraph(),
        },
        {
          key: getId(),
          type: 'data',
          value: getEmptyParagraph(),
        },
      ],
    },
  ],
};

const messages = defineMessages({
  insertRowBefore: {
    id: 'Insert row before',
    defaultMessage: 'Insert row before',
  },
  insertRowAfter: {
    id: 'Insert row after',
    defaultMessage: 'Insert row after',
  },
  deleteRow: {
    id: 'Delete row',
    defaultMessage: 'Delete row',
  },
  insertColBefore: {
    id: 'Insert col before',
    defaultMessage: 'Insert col before',
  },
  insertColAfter: {
    id: 'Insert col after',
    defaultMessage: 'Insert col after',
  },
  deleteCol: {
    id: 'Delete col',
    defaultMessage: 'Delete col',
  },
  fixed: {
    id: 'Fixed width table cells',
    defaultMessage: 'Fixed width table cells',
  },
  compact: {
    id: 'Make the table compact',
    defaultMessage: 'Make the table compact',
  },
  basic: {
    id: 'Reduce complexity',
    defaultMessage: 'Reduce complexity',
  },
  celled: {
    id: 'Divide each row into separate cells',
    defaultMessage: 'Divide each row into separate cells',
  },
  inverted: {
    id: 'Table color inverted',
    defaultMessage: 'Table color inverted',
  },
  striped: {
    id: 'Stripe alternate rows with color',
    defaultMessage: 'Stripe alternate rows with color',
  },
});

/**
 * Edit component for the Slate Table block type in Volto.
 * @class Edit
 * @extends Component
 */
class Edit extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    data: PropTypes.objectOf(PropTypes.any).isRequired,
    detached: PropTypes.bool,
    index: PropTypes.number.isRequired,
    selected: PropTypes.bool.isRequired,
    block: PropTypes.string.isRequired,
    onAddBlock: PropTypes.func.isRequired,
    onChangeBlock: PropTypes.func.isRequired,
    onDeleteBlock: PropTypes.func.isRequired,
    onInsertBlock: PropTypes.func.isRequired,
    onMutateBlock: PropTypes.func.isRequired,
    onFocusPreviousBlock: PropTypes.func.isRequired,
    onFocusNextBlock: PropTypes.func.isRequired,
    onSelectBlock: PropTypes.func.isRequired,
  };

  /**
   * Default properties
   * @property {Object} defaultProps Default properties.
   * @static
   */
  static defaultProps = {
    detached: false,
  };

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs WysiwygEditor
   */
  constructor(props) {
    super(props);
    this.state = {
      selected: {
        row: 0,
        cell: 0,
      },
      isClient: false,
    };
    this.onSelectCell = this.onSelectCell.bind(this);
    this.onInsertRowBefore = this.onInsertRowBefore.bind(this);
    this.onInsertRowAfter = this.onInsertRowAfter.bind(this);
    this.onInsertColBefore = this.onInsertColBefore.bind(this);
    this.onInsertColAfter = this.onInsertColAfter.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.onDeleteCol = this.onDeleteCol.bind(this);
    this.onChangeCell = this.onChangeCell.bind(this);
    this.toggleCellType = this.toggleCellType.bind(this);
    this.toggleBool = this.toggleBool.bind(this);
    this.toggleFixed = this.toggleFixed.bind(this);
    this.toggleCompact = this.toggleCompact.bind(this);
    this.toggleBasic = this.toggleBasic.bind(this);
    this.toggleCelled = this.toggleCelled.bind(this);
    this.toggleInverted = this.toggleInverted.bind(this);
    this.toggleStriped = this.toggleStriped.bind(this);
  }

  /**
   * Component did mount lifecycle method
   * @method componentDidMount
   * @returns {undefined}
   */
  componentDidMount() {
    if (!this.props.data.table) {
      this.props.onChangeBlock(this.props.block, {
        ...this.props.data,
        table: initialTable,
      });
    }
    this.setState({ isClient: true });
  }

  /**
   * Component will receive props lifecycle method
   * @method componentWillReceiveProps
   * @param {Object} nextProps Next properties
   * @returns {undefined}
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!nextProps.data.table) {
      this.props.onChangeBlock(nextProps.block, {
        ...nextProps.data,
        table: initialTable,
      });
    }
  }

  /**
   * Select cell handler
   * @method onSelectCell
   * @param {Number} row Row index.
   * @param {Number} cell Cell index.
   * @returns {undefined}
   */
  onSelectCell(row, cell) {
    this.setState({ selected: { row, cell } });
  }

  /**
   * Change cell handler
   * @param {Number} row Row index.
   * @param {Number} cell Cell index.
   * @param {Array} slateValue Value of the `SlateEditor` in the cell.
   * @returns {undefined}
   */
  onChangeCell(row, cell, slateValue) {
    const table = JSON.parse(JSON.stringify(this.props.data.table));
    table.rows[row].cells[cell] = {
      ...table.rows[row].cells[cell],
      value: JSON.parse(JSON.stringify(slateValue)),
    };
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      table,
    });
  }

  /**
   * Toggle cell type (from header to data or reverse)
   * @method toggleCellType
   * @returns {undefined}
   */
  toggleCellType() {
    const table = { ...this.props.data.table };
    let type =
      table.rows[this.state.selected.row].cells[this.state.selected.cell].type;
    table.rows[this.state.selected.row].cells[this.state.selected.cell].type =
      type === 'header' ? 'data' : 'header';
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      table,
    });
  }

  /**
   * Insert row before handler. Keeps the selected cell as selected after the
   * operation is done.
   * @returns {undefined}
   */
  onInsertRowBefore() {
    const table = this.props.data.table;
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      table: {
        ...table,
        rows: [
          ...table.rows.slice(0, this.state.selected.row),
          emptyRow(table.rows[0].cells),
          ...table.rows.slice(this.state.selected.row),
        ],
      },
    });
    this.setState({
      selected: {
        row: this.state.selected.row + 1,
        cell: this.state.selected.cell,
      },
    });
  }

  /**
   * Insert row after handler
   * @returns {undefined}
   */
  onInsertRowAfter() {
    const table = this.props.data.table;
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      table: {
        ...table,
        rows: [
          ...table.rows.slice(0, this.state.selected.row + 1),
          emptyRow(table.rows[0].cells),
          ...table.rows.slice(this.state.selected.row + 1),
        ],
      },
    });
  }

  /**
   * Insert column before handler. Keeps the selected cell as selected after the
   * operation is done.
   * @returns {undefined}
   */
  onInsertColBefore() {
    const table = this.props.data.table;
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      table: {
        ...table,
        rows: map(table.rows, (row, index) => ({
          ...row,
          cells: [
            ...row.cells.slice(0, this.state.selected.cell),
            emptyCell(table.rows[index].cells[this.state.selected.cell].type),
            ...row.cells.slice(this.state.selected.cell),
          ],
        })),
      },
    });
    this.setState({
      selected: {
        row: this.state.selected.row,
        cell: this.state.selected.cell + 1,
      },
    });
  }

  /**
   * Insert column after handler
   * @returns {undefined}
   */
  onInsertColAfter() {
    const table = this.props.data.table;
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      table: {
        ...table,
        rows: map(table.rows, (row, index) => ({
          ...row,
          cells: [
            ...row.cells.slice(0, this.state.selected.cell + 1),
            emptyCell(table.rows[index].cells[this.state.selected.cell].type),
            ...row.cells.slice(this.state.selected.cell + 1),
          ],
        })),
      },
    });
  }

  /**
   * Delete column handler. Changes the selected cell if the last table column
   * is selected.
   * @returns {undefined}
   */
  onDeleteCol() {
    const table = this.props.data.table;

    if (this.state.selected.cell === table.rows[0].cells.length - 1) {
      this.setState({
        selected: {
          row: this.state.selected.row,
          cell: this.state.selected.cell - 1,
        },
      });
    }

    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      table: {
        ...table,
        rows: map(table.rows, (row) => ({
          ...row,
          cells: remove(
            row.cells,
            (cell, index) => index !== this.state.selected.cell,
          ),
        })),
      },
    });
  }

  /**
   * Delete row handler. Changes the selected cell if the last table row is
   * selected.
   * @method onDeleteRow
   * @returns {undefined}
   */
  onDeleteRow() {
    const table = this.props.data.table;

    if (this.state.selected.row === table.rows.length - 1) {
      this.setState({
        selected: {
          row: this.state.selected.row - 1,
          cell: this.state.selected.cell,
        },
      });
    }

    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      table: {
        ...table,
        rows: remove(
          table.rows,
          (row, index) => index !== this.state.selected.row,
        ),
      },
    });
  }

  /**
   * Toggles bool state data ('fixed', 'compact' etc. can be true or false).
   * @method toggleBool
   * @param {string} value Key in the table state to toggle.
   * @returns {undefined}
   */
  toggleBool(value) {
    const table = this.props.data.table;
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      table: {
        ...table,
        [value]: !table[value],
      },
    });
  }

  /**
   * Toggle fixed
   * @method toggleFixed
   * @returns {undefined}
   */
  toggleFixed() {
    this.toggleBool('fixed');
  }

  /**
   * Toggle compact
   * @method toggleCompact
   * @returns {undefined}
   */
  toggleCompact() {
    this.toggleBool('compact');
  }

  /**
   * Toggle basic
   * @method toggleBasic
   * @returns {undefined}
   */
  toggleBasic() {
    this.toggleBool('basic');
  }

  /**
   * Toggle celled
   * @method toggleCelled
   * @returns {undefined}
   */
  toggleCelled() {
    this.toggleBool('celled');
  }

  /**
   * Toggle inverted
   * @method toggleInverted
   * @returns {undefined}
   */
  toggleInverted() {
    this.toggleBool('inverted');
  }

  /**
   * Toggle striped
   * @method toggleStriped
   * @returns {undefined}
   */
  toggleStriped() {
    this.toggleBool('striped');
  }

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    return (
      // TODO: use slate-table instead of table, but first copy the CSS styles
      // to the new name
      <div className={cx('block table', { selected: this.props.selected })}>
        {this.props.selected && (
          <div className="toolbar">
            <Button.Group>
              <Button
                icon
                basic
                onClick={this.onInsertRowBefore}
                title={this.props.intl.formatMessage(messages.insertRowBefore)}
                aria-label={this.props.intl.formatMessage(
                  messages.insertRowBefore,
                )}
              >
                <Icon name={rowSVG} size="24px" />
              </Button>
            </Button.Group>
            <Button.Group>
              <Button
                icon
                basic
                onClick={this.onInsertRowAfter}
                title={this.props.intl.formatMessage(messages.insertRowAfter)}
                aria-label={this.props.intl.formatMessage(
                  messages.insertRowAfter,
                )}
              >
                <Icon name={rowSVG} size="24px" />
              </Button>
            </Button.Group>
            <Button.Group>
              <Button
                icon
                basic
                onClick={this.onDeleteRow}
                disabled={
                  this.props.data.table &&
                  this.props.data.table.rows.length === 1
                }
                title={this.props.intl.formatMessage(messages.deleteRow)}
                aria-label={this.props.intl.formatMessage(messages.deleteRow)}
              >
                <Icon name={deleteSVG} size="24px" />
              </Button>
            </Button.Group>
            <Button.Group>
              <Button
                icon
                basic
                onClick={this.onInsertColBefore}
                title={this.props.intl.formatMessage(messages.insertColBefore)}
                aria-label={this.props.intl.formatMessage(
                  messages.insertColBefore,
                )}
              >
                <Icon name={colSVG} size="24px" />
              </Button>
            </Button.Group>
            <Button.Group>
              <Button
                icon
                basic
                onClick={this.onInsertColAfter}
                title={this.props.intl.formatMessage(messages.insertColAfter)}
                aria-label={this.props.intl.formatMessage(
                  messages.insertColAfter,
                )}
              >
                <Icon name={colSVG} size="24px" />
              </Button>
            </Button.Group>
            <Button.Group>
              <Button
                icon
                basic
                onClick={this.onDeleteCol}
                disabled={
                  this.props.data.table &&
                  this.props.data.table.rows[0].cells.length === 1
                }
                title={this.props.intl.formatMessage(messages.deleteCol)}
                aria-label={this.props.intl.formatMessage(messages.deleteCol)}
              >
                <Icon name={deleteSVG} size="24px" />
              </Button>
            </Button.Group>
          </div>
        )}
        {this.props.data.table && (
          <Table
            fixed={this.props.data.table.fixed}
            compact={this.props.data.table.compact}
            basic={this.props.data.table.basic ? 'very' : false}
            celled={this.props.data.table.celled}
            inverted={this.props.data.table.inverted}
            striped={this.props.data.table.striped}
          >
            <Table.Body>
              {map(this.props.data.table.rows, (row, rowIndex) => (
                <Table.Row key={row.key}>
                  {map(row.cells, (cell, cellIndex) => (
                    <Table.Cell
                      key={cell.key}
                      as={cell.type === 'header' ? 'th' : 'td'}
                      className={
                        rowIndex === this.state.selected.row &&
                        cellIndex === this.state.selected.cell &&
                        this.props.selected
                          ? 'selected'
                          : ''
                      }
                    >
                      <Cell
                        value={cell.value}
                        row={rowIndex}
                        cell={cellIndex}
                        onSelectCell={this.onSelectCell}
                        selected={
                          rowIndex === this.state.selected.row &&
                          cellIndex === this.state.selected.cell
                        }
                        isTableBlockSelected={this.props.selected}
                        onAddBlock={this.props.onAddBlock}
                        onSelectBlock={this.props.onSelectBlock}
                        onChange={this.onChangeCell}
                        index={this.props.index}
                      />
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
        {this.props.selected && this.state.isClient && (
          <Portal node={document.getElementById('sidebar-properties')}>
            <Form method="post" onSubmit={(event) => event.preventDefault()}>
              <Segment secondary attached>
                <FormattedMessage id="Table" defaultMessage="Table" />
              </Segment>
              <Segment attached>
                <Field
                  id="fixed"
                  title={this.props.intl.formatMessage(messages.fixed)}
                  type="boolean"
                  value={this.props.data.table && this.props.data.table.fixed}
                  onChange={() => this.toggleFixed()}
                />
                <Field
                  id="celled"
                  title={this.props.intl.formatMessage(messages.celled)}
                  type="boolean"
                  value={this.props.data.table && this.props.data.table.celled}
                  onChange={this.toggleCelled}
                />
                <Field
                  id="striped"
                  title={this.props.intl.formatMessage(messages.striped)}
                  type="boolean"
                  value={this.props.data.table && this.props.data.table.striped}
                  onChange={this.toggleStriped}
                />
                <Field
                  id="compact"
                  title={this.props.intl.formatMessage(messages.compact)}
                  type="boolean"
                  value={this.props.data.table && this.props.data.table.compact}
                  onChange={() => this.toggleCompact()}
                />
                <Field
                  id="basic"
                  title={this.props.intl.formatMessage(messages.basic)}
                  type="boolean"
                  value={this.props.data.table && this.props.data.table.basic}
                  onChange={this.toggleBasic}
                />
                <Field
                  id="inverted"
                  title={this.props.intl.formatMessage(messages.inverted)}
                  type="boolean"
                  value={
                    this.props.data.table && this.props.data.table.inverted
                  }
                  onChange={this.toggleInverted}
                />
              </Segment>
              <Segment secondary attached>
                <FormattedMessage id="Cell" defaultMessage="Cell" />
              </Segment>
              <Segment attached>
                <Field
                  id="celltype"
                  title="Header cell"
                  type="boolean"
                  value={
                    this.props.data.table &&
                    this.props.data.table.rows[this.state.selected.row].cells[
                      this.state.selected.cell
                    ].type === 'header'
                  }
                  onChange={this.toggleCellType}
                />
              </Segment>
            </Form>
          </Portal>
        )}
      </div>
    );
  }
}

export default injectIntl(Edit);
