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
import {
  unwrapFootnote,
  insertFootnote,
  isActiveFootnote,
  getActiveFootnote,
} from './utils';

export default (props) => {
  const { showEditor } = props;
  const editor = useSlate();
  const footnoteRef = React.useRef(null);
  const [footnoteNode] = getActiveFootnote(editor);
  const isFootnote = isActiveFootnote(editor);
  const [formData, setFormData] = React.useState({});

  // Update the form data based on the current footnote
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
              showEditor(false);
              saveDataToEditor(formData);
              ReactEditor.focus(editor);
            }}
          >
            <VoltoIcon size="24px" name={checkSVG} />
          </button>
          <button
            onClick={() => {
              showEditor(false);
              setFormData({});
              ReactEditor.focus(editor);
            }}
          >
            <VoltoIcon size="24px" name={clearSVG} />
          </button>
        </>
      }
    />
  );
};

// import formatClearSVG from '@plone/volto/icons/format-clear.svg';
// import { Editor, Range, Transforms } from 'slate';
