import { defineMessages } from 'react-intl';

const messages = defineMessages({
  hideHeaders: {
    id: 'Hide headers',
    defaultMessage: 'Hide headers',
  },
  sortable: {
    id: 'Make the table sortable',
    defaultMessage: 'Make the table sortable',
  },
  sortableDescription: {
    id: 'Visible only in view mode',
    defaultMessage: 'Visible only in view mode',
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
  textAlign: {
    id: 'Align text',
    defaultMessage: 'Align text',
  },
  verticalAlign: {
    id: 'Vertical align',
    defaultMessage: 'Vertical align',
  },
  left: {
    id: 'Left',
    defaultMessage: 'Left',
  },
  center: {
    id: 'Center',
    defaultMessage: 'Center',
  },
  right: {
    id: 'Right',
    defaultMessage: 'Right',
  },
  bottom: {
    id: 'Bottom',
    defaultMessage: 'Bottom',
  },
  middle: {
    id: 'Middle',
    defaultMessage: 'Middle',
  },
  top: {
    id: 'Top',
    defaultMessage: 'Top',
  },
});

export default (props) => {
  const { intl } = props;

  return {
    title: 'Table',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: [
          'hideHeaders',
          'sortable',
          'fixed',
          'celled',
          'striped',
          'compact',
          'basic',
          'inverted',
          'textAlign',
          'verticalAlign',
        ],
      },
    ],
    properties: {
      hideHeaders: {
        title: intl.formatMessage(messages.hideHeaders),
        type: 'boolean',
      },
      sortable: {
        title: intl.formatMessage(messages.sortable),
        description: 'Visible only in view mode',
        type: 'boolean',
      },
      fixed: {
        title: intl.formatMessage(messages.fixed),
        type: 'boolean',
      },
      celled: {
        title: intl.formatMessage(messages.celled),
        type: 'boolean',
      },
      striped: {
        title: intl.formatMessage(messages.striped),
        type: 'boolean',
      },
      compact: {
        title: intl.formatMessage(messages.compact),
        type: 'boolean',
      },
      basic: {
        title: intl.formatMessage(messages.basic),
        type: 'boolean',
      },
      inverted: {
        title: intl.formatMessage(messages.inverted),
        type: 'boolean',
      },
      textAlign: {
        title: intl.formatMessage(messages.textAlign),
        widget: 'align',
      },
      verticalAlign: {
        title: intl.formatMessage(messages.textAlign),
        choices: [
          ['bottom', intl.formatMessage(messages.bottom)],
          ['middle', intl.formatMessage(messages.middle)],
          ['top', intl.formatMessage(messages.top)],
        ],
      },
    },
    required: [],
  };
};
