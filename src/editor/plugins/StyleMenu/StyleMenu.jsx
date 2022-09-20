import React from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { Dropdown } from 'semantic-ui-react';
import { useIntl, defineMessages } from 'react-intl';
import cx from 'classnames';
import { isBlockStyleActive, isInlineStyleActive, toggleStyle } from './utils';
import config from '@plone/volto/registry';
import { ToolbarButton } from 'volto-slate/editor/ui';
import paintSVG from '@plone/volto/icons/paint.svg';

const messages = defineMessages({
  inlineStyle: {
    id: 'Inline Style',
    defaultMessage: 'Inline Style',
  },
  paragraphStyle: {
    id: 'Paragraph Style',
    defaultMessage: 'Paragraph Style',
  },
  additionalStyles: {
    id: 'Additional Styles',
    defaultMessage: 'Additional Styles',
  },
});

const StyleMenuButton = ({ icon, active, ...props }) => (
  <ToolbarButton {...props} icon={icon} active={active} />
);

const StylingsButton = () => {
  const editor = useSlate();
  const intl = useIntl();

  // Converting the settings to a format that is required by dropdowns.
  const inlineOpts = [
    {
      text: intl.formatMessage(messages.inlineStyle),
      disabled: false,
      selected: false,
      style: { opacity: 0.45 },
      onClick: (event) => event.preventDefault(),
    },
    ...config.settings.slate.styleMenu.inlineStyles.map((def) => {
      return {
        value: def.cssClass,
        text: def.label,
        icon: def.icon,
        isBlock: false,
      };
    }),
  ];
  const blockOpts = [
    {
      text: intl.formatMessage(messages.paragraphStyle),
      disabled: false,
      selected: false,
      style: { opacity: 0.45 },
      onClick: (event) => event.preventDefault(),
    },
    ...config.settings.slate.styleMenu.blockStyles.map((def) => {
      return {
        value: def.cssClass,
        text: def.label,
        icon: def.icon,
        isBlock: true,
      };
    }),
  ];

  // Calculating the initial selection.
  const toSelect = [];
  // block styles
  for (const val of blockOpts) {
    const ia = isBlockStyleActive(editor, val.value);
    if (ia) {
      toSelect.push(val);
    }
  }
  // inline styles
  for (const val of inlineOpts) {
    const ia = isInlineStyleActive(editor, val.value);
    if (ia) {
      toSelect.push(val);
    }
  }

  const showMenu = inlineOpts.length || blockOpts.length;
  return showMenu ? (
    <Dropdown
      className="style-menu"
      multiple
      value={toSelect}
      disabled={config.settings.slate.styleMenu.disabled ?? false}
      additionLabel={intl.formatMessage(messages.additionalStyles)}
      trigger={
        <StyleMenuButton
          title={intl.formatMessage(messages.additionalStyles)}
          icon={paintSVG}
          active={toSelect.length > 0}
        />
      }
    >
      <Dropdown.Menu>
        {inlineOpts.map((option, index) => {
          const isActive = toSelect.includes(option);
          return (
            <Dropdown.Item
              key={`inline-style-${index}`}
              as="span"
              active={isActive}
              className={cx({ active: isActive })}
              onClick={(event, selItem) => {
                event.stopPropagation();
                toggleStyle(editor, {
                  cssClass: selItem.value,
                  isBlock: selItem.isBlock,
                });
                ReactEditor.focus(editor);
              }}
              {...option}
            />
          );
        })}
        {blockOpts.map((option, index) => {
          const isActive = toSelect.includes(option);
          return (
            <Dropdown.Item
              key={`block-style-${index}`}
              as="span"
              active={isActive}
              className={cx({ active: isActive })}
              onClick={(event, selItem) => {
                event.stopPropagation();
                toggleStyle(editor, {
                  cssClass: selItem.value,
                  isBlock: selItem.isBlock,
                });
                ReactEditor.focus(editor);
              }}
              {...option}
            />
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  ) : (
    ''
  );
};

export default StylingsButton;
