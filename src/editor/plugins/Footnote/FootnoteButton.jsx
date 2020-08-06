import tagSVG from '@plone/volto/icons/tag.svg';
import React from 'react';
import { Editor, Range, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { ToolbarButton } from 'volto-slate/editor/ui';
import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';
import ZoteroDataWrapper from 'volto-slate/futurevolto/ZoteroDataWrapper';
import { nanoid } from 'volto-slate/utils';
import { FOOTNOTE } from './constants';
import './editor.less';
import { FootnoteSchema } from './schema';

// import AccordionWidget from 'volto-slate/futurevolto/AccordionWidget';
// import FootList from 'volto-slate/futurevolto/FootList';

// import { useSlate } from 'slate-react';
// import { Editor, Range, Transforms } from 'slate';
// import { ReactEditor } from 'slate-react';

// import { Icon as VoltoIcon } from '@plone/volto/components';
// import superindexSVG from '@plone/volto/icons/superindex.svg';
// import briefcaseSVG from '@plone/volto/icons/briefcase.svg';
// import formatClearSVG from '@plone/volto/icons/format-clear.svg';
// import checkSVG from '@plone/volto/icons/check.svg';
// import clearSVG from '@plone/volto/icons/clear.svg';

// import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';
// import InlineForm from 'volto-slate/futurevolto/InlineForm';

// import { ToolbarButton } from 'volto-slate/editor/ui';
// import { FootnoteSchema } from './schema';
// import { FOOTNOTE } from './constants';

// import { nanoid } from 'volto-slate/utils';

export const wrapFootnote = (editor, data) => {
  if (isActiveFootnote(editor)) {
    unwrapFootnote(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const footnote = {
    type: FOOTNOTE,
    data,
  };

  console.log('data', data);

  if (isCollapsed) {
    Transforms.insertNodes(editor, footnote);
  } else {
    Transforms.wrapNodes(editor, footnote, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

function insertFootnote(editor, data) {
  if (editor.selection) {
    wrapFootnote(editor, data);
  }
}

function unwrapFootnote(editor) {
  Transforms.unwrapNodes(editor, { match: (n) => n.type === FOOTNOTE });
}

export const isActiveFootnote = (editor) => {
  const [note] = Editor.nodes(editor, { match: (n) => n.type === FOOTNOTE });

  return !!note;
};

export const getActiveFootnote = (editor) => {
  const [note] = Editor.nodes(editor, { match: (n) => n.type === FOOTNOTE });
  return note;
};

const FootnoteButton = () => {
  const editor = useSlate();
  const [showForm, setShowForm] = React.useState(false);
  const [selection, setSelection] = React.useState(null);
  const [formData, setFormdata] = React.useState({});

  const submitHandler = React.useCallback(
    (formData) => {
      // TODO: have an algorithm that decides which one is used
      const { footnote } = formData;
      console.log('formData', formData);
      console.log('footnote', footnote);
      if (footnote) {
        Transforms.select(editor, selection);
        insertFootnote(editor, { ...formData, uid: nanoid(5) });
      } else {
        unwrapFootnote(editor);
      }
    },
    [editor, selection],
  );

  const isFootnote = isActiveFootnote(editor);

  console.log('formData', formData);

  return (
    <>
      <SidebarPopup open={showForm}>
        <ZoteroDataWrapper
          schema={FootnoteSchema}
          title={FootnoteSchema.title}
          formData={formData}
          onChangeField={setFormdata}
          submitHandler={(newFormData) => {
            setShowForm(false);
            submitHandler(newFormData);
            ReactEditor.focus(editor);
          }}
          clearHandler={() => {
            setShowForm(false);
            unwrapFootnote(editor);
            ReactEditor.focus(editor);
          }}
          hideHandler={() => {
            setShowForm(false);
            ReactEditor.focus(editor);
          }}
        />
      </SidebarPopup>
      <ToolbarButton
        active={isFootnote}
        onMouseDown={() => {
          if (!showForm) {
            setSelection(editor.selection);

            const note = getActiveFootnote(editor);
            if (note) {
              const [node] = note;
              const { data } = node;
              setFormdata(data);
            }

            setShowForm(true);
          }
        }}
        icon={tagSVG}
      />
    </>
  );
};

export default FootnoteButton;
