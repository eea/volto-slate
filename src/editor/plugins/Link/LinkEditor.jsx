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

import {
  unwrapLink,
  insertLink,
  isActiveLink,
  getActiveLink,
} from './utils';

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
      var url = formData?.link?.external_link;
      const data = {...formData};
      if (url) {
        console.log('data:', formData);
        insertLink(editor, url, data);
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
