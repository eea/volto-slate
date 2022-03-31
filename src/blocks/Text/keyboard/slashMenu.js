export const slashMenu = ({ editor, event }) => {
  //
};

/**

  const onKeyDown = ({ editor, event }) => {
    if (slashCommand) {
      switch (event.key) {
        case 'ArrowUp':
          setSlashMenuSelected(
            slashMenuSelected === 0 ? slashMenuSize - 1 : slashMenuSelected - 1,
          );
          event.preventDefault();
          break;
        case 'ArrowDown':
          setSlashMenuSelected(
            slashMenuSelected >= slashMenuSize - 1 ? 0 : slashMenuSelected + 1,
          );
          event.preventDefault();
          break;
        case 'Enter':
          if (slashMenuSize > 0) {
            onInsertBlock(
              block,
              {
                '@type': filteredBlocksConfig[slashMenuSelected].id,
              },
              {
                value: [
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                    type: 'p',
                  },
                ],
                plaintext: '',
              },
            );
          }
          event.preventDefault();
          break;
        default:
          handleKey({ editor, event });
          break;
      }
    } else {
      handleKey({ editor, event });
    }
  };

*/
