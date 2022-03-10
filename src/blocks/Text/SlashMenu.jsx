import React from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash';
import { Menu } from 'semantic-ui-react';
import { useIntl, FormattedMessage } from 'react-intl';
import { Icon } from '@plone/volto/components';
import config from '@plone/volto/registry';

const SlashMenu = ({
  currentBlock,
  onInsertBlock,
  selected,
  blocksConfig = config.blocks.blocksConfig,
}) => {
  const intl = useIntl();

  return (
    <div className="power-user-menu">
      <Menu vertical fluid borderless>
        {map(blocksConfig, (block, index) => (
          <Menu.Item
            key={block.id}
            className={block.id}
            active={index === selected}
            onClick={(e) => {
              onInsertBlock(currentBlock, { '@type': block.id });
              e.stopPropagation();
            }}
          >
            <Icon name={block.icon} size="24px" />
            {intl.formatMessage({
              id: block.title,
              defaultMessage: block.title,
            })}
          </Menu.Item>
        ))}
        {blocksConfig.length === 0 && (
          <Menu.Item>
            <FormattedMessage
              id="No matching blocks"
              defaultMessage="No matching blocks"
            />
          </Menu.Item>
        )}
      </Menu>
    </div>
  );
};

SlashMenu.propTypes = {
  currentBlock: PropTypes.string.isRequired,
  onInsertBlock: PropTypes.func,
  selected: PropTypes.number,
  blocksConfig: PropTypes.arrayOf(PropTypes.any),
};

export default SlashMenu;
