import React from 'react';
import { Icon as VoltoIcon } from '@plone/volto/components';

import { ReactEditor } from 'slate-react';
import { useSlate } from 'slate-react';
import { isEqual } from 'lodash';

import { Editor, Range, Transforms } from 'slate';

import LinkEditSchema from './schema';
import briefcaseSVG from '@plone/volto/icons/briefcase.svg';
import checkSVG from '@plone/volto/icons/check.svg';
import clearSVG from '@plone/volto/icons/clear.svg';

import InlineForm from 'volto-slate/futurevolto/InlineForm';
import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';

import { flattenToAppURL } from '@plone/volto/helpers';

import { unwrapLink, insertLink, isActiveLink, getActiveLink } from './utils';

import { LINK_EDITOR } from './constants';
import { useDispatch } from 'react-redux';

export default (props) => {
  const dispatch = useDispatch();
  const editor = useSlate();
  const [formData, setFormData] = React.useState({});

  const active = getActiveLink(editor);
  const [linkNode] = active;
  const isLink = isActiveLink(editor);

  const linkRef = React.useRef(null);
  React.useEffect(() => {
    if (isLink && !isEqual(linkNode, linkRef.current)) {
      linkRef.current = linkNode;
      setFormData(linkNode.data || {});
    } else if (!isLink) {
      linkRef.current = null;
    }
  }, [linkNode, isLink, dispatch]);

  const saveDataToEditor = React.useCallback(
    (formData) => {
      console.log('formData', formData);

      // TODO: the selector for link target is broken
      // TODO: the object browser widget is configured so that multiple objects can be selected, but a link has only one target (there is a setting of the object browser widget, some variable that begins its name with 'max')
      // TODO: the object selected as internal link is saved correctly but when the link edit form is loaded, its value is not set to the object browser widget
      // TODO: the link edit form allows to set fields that cannot be working at the same time: enter an email address and an internal link and the internal link is working although maybe the last tab selected by the user is email

      const data = { ...formData };

      if (Object.keys(data).length === 0) {
        unwrapLink(editor);
        return;
      }

      const internalLink = data?.link?.internal_link?.[0];
      const url = data?.link?.external_link;
      const emailAddress = data?.link?.email_address;

      if (internalLink) {
        const { title } = data;
        const { UID } = internalLink;

        insertLink(editor, internalLink['@id'], {
          UID,
          title,
        });
      } else if (url) {
        insertLink(editor, url, data);
      } else if (emailAddress) {
        const emailData = {
          email_address: emailAddress,
          email_subject: data?.link.email_subject,
        };
        insertLink(
          editor,
          `mailto:${emailData.email_address}` +
            (emailData.email_subject
              ? `?subject=${emailData.email_subject}`
              : ''),
          emailData,
        );
      } else {
        unwrapLink(editor);
      }
    },
    [editor],
  );

  return (
    <SidebarPopup open={true}>
      <InlineForm
        schema={LinkEditSchema}
        title={LinkEditSchema.title}
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
                saveDataToEditor(formData);
                dispatch({ type: LINK_EDITOR, show: false });
                ReactEditor.focus(editor);
              }}
            >
              <VoltoIcon size="24px" name={checkSVG} />
            </button>
            <button
              onClick={() => {
                dispatch({ type: LINK_EDITOR, show: false });
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
  );
};
