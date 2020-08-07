import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { Button } from 'semantic-ui-react';

import { useSlate } from 'slate-react';
import { ReactEditor } from 'slate-react';

import { Icon as VoltoIcon } from '@plone/volto/components';
import { Icon } from '@plone/volto/components';

import { ToolbarButton } from 'volto-slate/editor/ui';

import InlineForm from 'volto-slate/futurevolto/InlineForm';
import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';

import { FootnoteSchema } from './schema';
import {
  getActiveFootnote,
  isActiveFootnote,
  insertFootnote,
  unwrapFootnote,
} from './utils';

import checkSVG from '@plone/volto/icons/check.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import editingSVG from '@plone/volto/icons/editing.svg';
import tagSVG from '@plone/volto/icons/tag.svg';
import briefcaseSVG from '@plone/volto/icons/briefcase.svg';

import './less/editor.less';

// import formatClearSVG from '@plone/volto/icons/format-clear.svg';
// import { isEqual } from 'lodash';

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

const FootnoteButton = () => {
  const editor = useSlate();
  const intl = useIntl();

  const isFootnote = isActiveFootnote(editor);

  const [showEditForm, setShowEditForm] = React.useState(false);
  const [formData, setFormData] = React.useState({});

  const saveDataToEditor = React.useCallback(
    (formData) => {
      if (formData.footnote) {
        insertFootnote(editor, formData);
      } else {
        unwrapFootnote(editor);
      }
    },
    [editor],
  );

  const PluginToolbar = React.useCallback(
    () => (
      <>
        <Button.Group>
          <Button
            icon
            basic
            aria-label={intl.formatMessage(messages.edit)}
            onMouseDown={() => {
              setShowEditForm(true);
              const note = getActiveFootnote(editor);

              if (note) {
                const [node] = note;
                const { data } = node;
                setFormData(data);
              } else {
                setFormData({});
              }
              // ReactEditor.focus(editor);
            }}
          >
            <Icon name={editingSVG} size="18px" />
          </Button>
          <Button
            icon
            basic
            aria-label={intl.formatMessage(messages.delete)}
            onMouseDown={() => {
              unwrapFootnote(editor);
              ReactEditor.focus(editor);
            }}
          >
            <Icon name={clearSVG} size="18px" />
          </Button>
        </Button.Group>
      </>
    ),
    [editor, intl],
  );

  const loadedHook = React.useRef();
  const isLoaded = loadedHook.current;
  React.useEffect(() => {
    if (!loadedHook.current) {
      console.log('Loading Hook');
      editor.addPluginHook('footnote-buttons', (editor) =>
        isActiveFootnote(editor) ? PluginToolbar : null,
      );
      loadedHook.current = true;
    }
  }, [isLoaded, editor, PluginToolbar]);

  return (
    <>
      <SidebarPopup open={showEditForm}>
        <InlineForm
          schema={FootnoteSchema}
          title={FootnoteSchema.title}
          icon={<VoltoIcon size="24px" name={briefcaseSVG} />}
          onChangeField={(id, value) => {
            setFormData({
              ...formData,
              [id]: value,
            });
          }}
          formData={formData}
          headerActions={
            <>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  saveDataToEditor(formData);
                  ReactEditor.focus(editor);
                }}
              >
                <VoltoIcon size="24px" name={checkSVG} />
              </button>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setFormData({});
                  ReactEditor.focus(editor);
                }}
              >
                <VoltoIcon size="24px" name={clearSVG} />
              </button>
            </>
          }
        />
      </SidebarPopup>

      <ToolbarButton
        active={isFootnote}
        disabled={isFootnote}
        onMouseDown={() => {
          setShowEditForm(true);
          const note = getActiveFootnote(editor);
          if (!note) {
            insertFootnote(editor, {});
            setFormData({});
          }
        }}
        icon={tagSVG}
      />
    </>
  );
};

export default FootnoteButton;
