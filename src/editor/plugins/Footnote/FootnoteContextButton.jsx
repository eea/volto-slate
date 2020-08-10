import React from 'react';
import editingSVG from '@plone/volto/icons/editing.svg';
import { useIntl, defineMessages } from 'react-intl';
import {
  isActiveFootnote,
  unwrapFootnote,
  // getActiveFootnote,
  // insertFootnote,
} from './utils';
import clearSVG from '@plone/volto/icons/delete.svg';
import { ToolbarButton } from 'volto-slate/editor/ui';
import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';
import FootnoteEditor from './FootnoteEditor';

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

export default (editor) => {
  if (!isActiveFootnote(editor)) {
    return null;
  }
  const intl = useIntl();
  const [showEditForm, setShowEditForm] = React.useState(false);

  return (
    <React.Fragment key="footnote">
      {showEditForm && (
        <SidebarPopup open={true}>
          <FootnoteEditor showEditor={setShowEditForm} />
        </SidebarPopup>
      )}
      <ToolbarButton
        icon={editingSVG}
        aria-label={intl.formatMessage(messages.edit)}
        onMouseDown={() => {
          setShowEditForm(true);
        }}
      />
      <ToolbarButton
        icon={clearSVG}
        aria-label={intl.formatMessage(messages.delete)}
        alt={intl.formatMessage(messages.delete)}
        onMouseDown={() => {
          unwrapFootnote(editor);
        }}
      />
    </React.Fragment>
  );
};
