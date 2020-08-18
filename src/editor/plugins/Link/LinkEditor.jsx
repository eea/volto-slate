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

  const slateLinkDataToVoltoFormData = React.useCallback(
    (fd) => {
      // fd is the old formData
      // ld is a part of the new link data
      const ld = {};

      if (fd.object) {
        // internal link
        ld.internal_link = [fd.object];
      } else if (fd.email_address) {
        // email link
        ld.email_address = fd.email_address;
        ld.email_subject = fd.email_subject;
      } else if (linkNode.url) {
        // external link
        ld.external_link = linkNode.url;
      } else {
        // emptied form
      }

      return { link: ld, title: fd.title, target: fd.target };
    },
    [linkNode],
  );

  const linkRef = React.useRef(null);
  React.useEffect(() => {
    if (isLink && !isEqual(linkNode, linkRef.current)) {
      linkRef.current = linkNode;
      setFormData(slateLinkDataToVoltoFormData(linkNode.data || {}));
    } else if (!isLink) {
      linkRef.current = null;
    }
  }, [linkNode, isLink, dispatch, slateLinkDataToVoltoFormData]);

  const saveDataToEditor = React.useCallback(
    (formData) => {
      // TODO: protect from inserting wrong URLs, also for security
      // TODO: somehow store in the Slate doc just the @id and eventually UID, because the rest of the data associated to an @id can change, and also check if the (U)ID still exists when opening the link edit form with a preselected object in the object browser widget
      // TODO: not important: the selector for link target is broken
      // TODO: not important: the link edit form allows to set fields that cannot be working at the same time: enter an email address and an internal link and the internal link is working although maybe the last tab selected by the user is email
      // TODO: write comments and doc comments

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

        insertLink(editor, internalLink['@id'], {
          object: internalLink,
          title,
        });
      } else if (url) {
        insertLink(editor, url);
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
