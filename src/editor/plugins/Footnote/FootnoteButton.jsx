import React from 'react';
import { useSlate } from 'slate-react';
import { Editor, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

import { Icon as VoltoIcon } from '@plone/volto/components';
import tagSVG from '@plone/volto/icons/tag.svg';
import briefcaseSVG from '@plone/volto/icons/briefcase.svg';
import formatClearSVG from '@plone/volto/icons/format-clear.svg';
import checkSVG from '@plone/volto/icons/check.svg';
import clearSVG from '@plone/volto/icons/clear.svg';

import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';
import InlineForm from 'volto-slate/futurevolto/InlineForm';

import { ToolbarButton } from 'volto-slate/editor/ui';
import { FootnoteSchema } from './schema';
import { FOOTNOTE } from 'volto-slate/constants';

// import { SidebarFootnoteForm } from './SidebarFootnoteForm';

import './less/editor.less';
import FootnoteContext from '../../ui/FootnoteContext';

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

export const unwrapFootnote = (editor) => {
  Transforms.unwrapNodes(editor, { match: (n) => n.type === FOOTNOTE });
};

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
  const isFootnote = isActiveFootnote(editor);

  const footnoteRef = React.useRef(null);
  // const footnote = React.useContext(FootnoteContext);

  // TODO: use a new component: SidebarFootnoteForm

  const submitHandler = React.useCallback(
    (formData) => {
      // TODO: have an algorithm that decides which one is used
      const { localFootnote } = formData;
      if (localFootnote) {
        Transforms.select(editor, footnoteRef.current.selection);
        insertFootnote(editor, { ...formData });
      } else {
        unwrapFootnote(editor);
      }
    },
    [editor, footnoteRef],
  );

  return (
    <FootnoteContext.Consumer>
      {(footnote) => {
        footnoteRef.current = footnote;
        return (
          <>
            <SidebarPopup open={footnote.getShowForm()}>
              <InlineForm
                schema={FootnoteSchema}
                title={FootnoteSchema.title}
                icon={<VoltoIcon size="24px" name={briefcaseSVG} />}
                onChangeField={(id, value) => {
                  footnote.setFormData({
                    ...footnote.getFormData(),
                    [id]: value,
                  });
                }}
                formData={footnote.getFormData()}
                headerActions={
                  <>
                    <button
                      onClick={() => {
                        footnote.setShowForm(false);
                        submitHandler(footnote.getFormData());
                        ReactEditor.focus(editor);
                      }}
                    >
                      <VoltoIcon size="24px" name={checkSVG} />
                    </button>
                    <button
                      onClick={() => {
                        footnote.setShowForm(false);
                        unwrapFootnote(editor);
                        ReactEditor.focus(editor);
                      }}
                    >
                      <VoltoIcon size="24px" name={formatClearSVG} />
                    </button>
                    <button
                      onClick={() => {
                        footnote.setShowForm(false);
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
              onMouseDown={() => {
                console.log(editor);
                if (!footnote.getShowForm()) {
                  footnote.setSelection(editor.selection);

                  const note = getActiveFootnote(editor);
                  if (note) {
                    const [node] = note;
                    const { data } = node;
                    footnote.setFormData(data);
                  }

                  footnote.setShowForm(true);
                }
              }}
              icon={tagSVG}
            />
          </>
        );
      }}
    </FootnoteContext.Consumer>
  );
};

export default FootnoteButton;
