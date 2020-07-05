import React from 'react';
import { useSlate } from 'slate-react';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { Segment } from 'semantic-ui-react';

import { Icon as VoltoIcon } from '@plone/volto/components';
import superindexSVG from '@plone/volto/icons/superindex.svg';
import briefcaseSVG from '@plone/volto/icons/briefcase.svg';
import formatClearSVG from '@plone/volto/icons/format-clear.svg';
import checkSVG from '@plone/volto/icons/check.svg';
import clearSVG from '@plone/volto/icons/clear.svg';

import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';
import InlineForm from 'volto-slate/futurevolto/InlineForm';

import { ToolbarButton } from 'volto-slate/editor/ui';
import FootnoteSchema from './schema';

function insertFootnote() {}

function unwrapFootnote() {}

const FootnoteButton = () => {
  const editor = useSlate();
  const [showForm, setShowForm] = React.useState(false);
  const [selection, setSelection] = React.useState(null);
  const [data, setData] = React.useState({});

  const submitHandler = React.useCallback(
    (formData) => {
      // TODO: have an algorithm that decides which one is used
      console.log('formdata', formData, selection);
      const { footnote } = formData;
      if (footnote) {
        Transforms.select(editor, selection);
        insertFootnote(editor, footnote);
      } else {
        unwrapFootnote(editor);
      }
    },
    [editor, selection],
  );

  const isFootnote = true;

  return (
    <>
      <SidebarPopup open={showForm} icon={briefcaseSVG} actions={'bla'}>
        <InlineForm
          schema={FootnoteSchema}
          title={FootnoteSchema.title}
          icon={<VoltoIcon size="24px" name={briefcaseSVG} />}
          onChangeField={(id, value) => {
            setData({ ...data, [id]: value });
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
                <VoltoIcon size="24px" name={formatClearSVG} />
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  console.log('editor', editor);
                  ReactEditor.focus(editor);
                }}
              >
                <VoltoIcon size="24px" name={clearSVG} />
              </button>
            </>
          }
        />
        <Segment>bla</Segment>
      </SidebarPopup>

      <div className="grouper">
        <div className="grouper-wrapper">
          <ToolbarButton
            active={isFootnote}
            onMouseDown={() => {
              if (!showForm) {
                setSelection(editor.selection);
                setShowForm(true);
              }
            }}
            icon={superindexSVG}
          />
        </div>
      </div>
    </>
  );
};

// {isFootnote && (
//   <ToolbarButton
//     onMouseDown={() => unwrapFootnote(editor)}
//     icon={formatClearSVG}
//   />
// )}

export default FootnoteButton;
