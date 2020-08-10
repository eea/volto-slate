import React from 'react';
import InlineForm from 'volto-slate/futurevolto/InlineForm';
import { FootnoteSchema } from './schema';
import { Icon as VoltoIcon } from '@plone/volto/components';
import briefcaseSVG from '@plone/volto/icons/briefcase.svg';
import { ReactEditor } from 'slate-react';
import checkSVG from '@plone/volto/icons/check.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import { useSlate } from 'slate-react';
import { isEqual } from 'lodash';
import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';
import {
  unwrapFootnote,
  insertFootnote,
  isActiveFootnote,
  getActiveFootnote,
} from './utils';
import { FOOTNOTE_EDITOR } from './constants';
import { useDispatch } from 'react-redux';

export default (props) => {
  const dispatch = useDispatch();
  const editor = useSlate();
  const [formData, setFormData] = React.useState({});

  const active = getActiveFootnote(editor);
  const [footnoteNode] = active;
  const isFootnote = isActiveFootnote(editor);

  // Update the form data based on the current footnote
  const footnoteRef = React.useRef(null);
  React.useEffect(() => {
    if (isFootnote && !isEqual(footnoteNode, footnoteRef.current)) {
      footnoteRef.current = footnoteNode;
      setFormData(footnoteNode.data || {});
    } else if (!isFootnote) {
      footnoteRef.current = null;
    }
  }, [footnoteNode, isFootnote]);

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

  return (
    <SidebarPopup open={true}>
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
                saveDataToEditor(formData);
                dispatch({ type: FOOTNOTE_EDITOR, show: false });
                ReactEditor.focus(editor);
              }}
            >
              <VoltoIcon size="24px" name={checkSVG} />
            </button>
            <button
              onClick={() => {
                dispatch({ type: FOOTNOTE_EDITOR, show: false });
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

// import formatClearSVG from '@plone/volto/icons/format-clear.svg';
// import { Editor, Range, Transforms } from 'slate';
