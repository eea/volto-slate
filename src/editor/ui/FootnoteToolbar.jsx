import React from 'react';

import { Button } from 'semantic-ui-react';

import { Icon } from '@plone/volto/components';
import editingSVG from '@plone/volto/icons/editing.svg';
import clearSVG from '@plone/volto/icons/clear.svg';

import { useIntl, defineMessages } from 'react-intl';

import {
  isActiveFootnote,
  unwrapFootnote,
  getActiveFootnote,
  handleFootnoteButtonClick,
} from '../plugins/Footnote/FootnoteButton';
import { useEditor } from 'slate-react';
import FootnoteContext from './FootnoteContext';

import { Range } from 'slate';

const messages = defineMessages({
  edit: {
    id: 'Edit footnote',
    defaultMessage: 'Edit footnote',
  },
  delete: {
    id: 'Delete footnote',
    defaultMessage: 'Delete footnote',
  },
});

export const FootnoteToolbar = ({ selected }) => {
  const intl = useIntl();
  const editor = useEditor();
  const isFootnote = isActiveFootnote(editor);

  return (
    selected &&
    (editor.selection
      ? // shows the toolbar just when the selection is and is collapsed:
        editor.selection && Range.isCollapsed(editor.selection)
      : true) &&
    isFootnote && (
      <FootnoteContext.Consumer>
        {(footnote) => {
          return (
            <div className="toolbar">
              <Button.Group>
                <Button
                  icon
                  basic
                  aria-label={intl.formatMessage(messages.edit)}
                  onMouseDown={() => {
                    handleFootnoteButtonClick(editor, footnote);
                  }}
                >
                  <Icon name={editingSVG} size="24px" />
                </Button>
              </Button.Group>
              <Button.Group>
                <Button
                  icon
                  basic
                  aria-label={intl.formatMessage(messages.delete)}
                  onMouseDown={() => {
                    unwrapFootnote(editor);
                  }}
                >
                  <Icon name={clearSVG} size="24px" />
                </Button>
              </Button.Group>
            </div>
          );
        }}
      </FootnoteContext.Consumer>
    )
  );
};

export default FootnoteToolbar;
