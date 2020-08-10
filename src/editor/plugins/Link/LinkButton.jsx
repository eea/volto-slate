import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { useSlate } from 'slate-react';
import { ReactEditor } from 'slate-react';
import { Editor, Range, Transforms } from 'slate';

import { Button } from 'semantic-ui-react';
import { Icon as VoltoIcon } from '@plone/volto/components';

import { ToolbarButton } from 'volto-slate/editor/ui';
import { LINK } from 'volto-slate/constants';
import usePluginToolbar from 'volto-slate/editor/usePluginToolbar';
import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';
import InlineForm from 'volto-slate/futurevolto/InlineForm';

import {
  getActiveLink,
  isLinkActive,
  insertLink,
  wrapLink,
  unwrapLink,
} from './utils';
import LinkEditSchema from './schema';

import briefcaseSVG from '@plone/volto/icons/briefcase.svg';
import checkSVG from '@plone/volto/icons/check.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import editingSVG from '@plone/volto/icons/editing.svg';
import linkSVG from '@plone/volto/icons/link.svg';
import unlinkSVG from '@plone/volto/icons/unlink.svg';


// TODO: reset fields in form when opening the form again

const messages = defineMessages({
  edit: {
    id: 'Edit link',
    defaultMessage: 'Edit link',
  },
  delete: {
    id: 'Remove link',
    defaultMessage: 'Remove link',
  },
});

export const updateLinksContextFromActiveLinks = (
  editor,
  {
    setFormData,
    setAndSaveSelection,
    saveSelection = true,
    clearIfNoActiveLink = true,
  },
) => {
  if (saveSelection) {
    setAndSaveSelection(editor.selection);
  }

  const link = getActiveLink(editor);
  if (link) {
    const [node] = link;
    const { data, children } = node;

    const r = {
      ...data,
    };

    setFormData(r);
  } else if (editor.selection && clearIfNoActiveLink) {
    setFormData({});
  }
};

const LinkButton = () => {
  const editor = useSlate();
  const intl = useIntl();
  const [showForm, setShowForm] = React.useState(false);
  const [selection, setSelection] = React.useState(null);
  const [data, setFormData] = React.useState({});

  const isLink = isLinkActive(editor);

  const setAndSaveSelection = React.useCallback((sel) => {
    setSelection(sel);
    setShowForm(false);
  }, []);

  const submitHandler = React.useCallback(
    (formData) => {
      // TODO: have an algorithm that decides which one is used
      const url = formData?.link?.external_link;
      const data = { ...formData };
      if (url) {
        const sel = selection;
        if (Range.isRange(sel)) {
          Transforms.select(editor, sel);
          insertLink(editor, url, data);
        } else {
          Transforms.deselect(editor);
        }
      } else {
        unwrapLink(editor);
      }
      setShowForm(false);
    },
    [editor, selection],
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
              if (!showForm) {
                updateLinksContextFromActiveLinks(editor, {
                  setAndSaveSelection,
                  setFormData,
                });

                setShowForm(true);
                // ReactEditor.focus(editor);
              }
            }}
          >
            <VoltoIcon name={editingSVG} size="18px" />
          </Button>
        </Button.Group>
        <Button.Group>
          <Button
            icon
            basic
            aria-label={intl.formatMessage(messages.delete)}
            onMouseDown={() => {
              unwrapLink(editor);
              ReactEditor.focus(editor);
            }}
          >
            <VoltoIcon name={unlinkSVG} size="18px" />
          </Button>
        </Button.Group>
      </>
    ),
    [editor, intl, setAndSaveSelection, showForm],
  );

  usePluginToolbar(editor, isLinkActive, getActiveLink, PluginToolbar);

  return (
    <>
      <SidebarPopup open={showForm}>
        <InlineForm
          schema={LinkEditSchema}
          title="Insert link"
          icon={<VoltoIcon size="24px" name={briefcaseSVG} />}
          onChangeField={(id, value) => {
            setFormData({
              ...data,
              [id]: value,
            });
          }}
          formData={data}
          headerActions={
            <>
              <button
                onClick={() => {
                  setShowForm(false);
                  submitHandler(data);
                  ReactEditor.focus(editor);
                }}
              >
                <VoltoIcon size="24px" name={checkSVG} />
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
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
        active={isLink}
        disabled={isLink}
        onMouseDown={() => {
          const link = getActiveLink(editor);
          setShowForm(true);
          if (!link) {
            insertLink(editor, {});
            setFormData({});
          }
        }}
        icon={linkSVG}
      />
    </>
  );
};

export default LinkButton;
