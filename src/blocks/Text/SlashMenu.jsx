import React from 'react';
import PropTypes from 'prop-types';
import { map, filter, isEmpty } from 'lodash';
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

/**
 * A SlashMenu wrapper implemented as a volto-slate PersistentHelper.
 */
const PersistentSlashMenu = ({ editor }) => {
  const props = editor.getBlockProps();
  const {
    block,
    blocksConfig,
    data,
    onInsertBlock,
    onMutateBlock,
    onSelectBlock,
    properties,
    selected,
    allowedBlocks,
    detached,
  } = props;
  const disableNewBlocks = data?.disableNewBlocks || detached;

  const [slashMenuSelected, setSlashMenuSelected] = React.useState(0);

  const useAllowedBlocks = !isEmpty(allowedBlocks);
  const slashCommand = data.plaintext?.trim().match(/^\/([a-z]*)$/);

  const availableBlocks = filter(blocksConfig, (item) =>
    useAllowedBlocks
      ? allowedBlocks.includes(item.id)
      : typeof item.restricted === 'function'
      ? !item.restricted({ properties, block: item })
      : !item.restricted,
  )
    .filter((block) => slashCommand && block.id.indexOf(slashCommand[1]) === 0)
    .sort((a, b) => (a.title < b.title ? -1 : 1));

  const slashMenuSize = availableBlocks.length;
  if (slashMenuSelected > slashMenuSize - 1) {
    setSlashMenuSelected(slashMenuSize - 1);
  }

  const show = selected && slashCommand && !disableNewBlocks;

  React.useEffect(() => {
    editor.showSlashMenu = show;
    return () => (editor.showSlashMenu = false);
  }, [editor, show]);

  return (
    show && (
      <SlashMenu
        data={data}
        currentBlock={block}
        onInsertBlock={(id, value) => {
          onSelectBlock(onInsertBlock(id, value));
        }}
        onMutateBlock={onMutateBlock}
        availableBlocks={availableBlocks}
        properties={properties}
        search={slashCommand[1]}
        selected={slashMenuSelected}
      />
    )
  );
};

const optimizer = (WrappedComponent) => (props) => {
  return props.selected ? '' : <WrappedComponent {...props} />;
};

export default optimizer(PersistentSlashMenu);
