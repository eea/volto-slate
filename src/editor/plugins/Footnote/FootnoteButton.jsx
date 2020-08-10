import { Button } from 'semantic-ui-react';
import React from 'react';
import { Portal } from 'react-dom';
import { useSlate } from 'slate-react';
import { Editor, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import SidebarPopup from 'volto-slate/futurevolto/SidebarPopup';

import { Icon as VoltoIcon } from '@plone/volto/components';
import tagSVG from '@plone/volto/icons/tag.svg';
import briefcaseSVG from '@plone/volto/icons/briefcase.svg';
import formatClearSVG from '@plone/volto/icons/format-clear.svg';
import { Icon } from '@plone/volto/components';

import InlineForm from 'volto-slate/futurevolto/InlineForm';

import { ToolbarButton } from 'volto-slate/editor/ui';
import { FootnoteSchema } from './schema';
import { FOOTNOTE } from 'volto-slate/constants';
import { useIntl, defineMessages } from 'react-intl';
import checkSVG from '@plone/volto/icons/check.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import editingSVG from '@plone/volto/icons/editing.svg';

import { isEqual } from 'lodash';

// import { PluginSidebarPortal } from 'volto-slate/editor/ui';
// import FootnoteContext from '../../ui/FootnoteContext';
// import { SidebarFootnoteForm } from './SidebarFootnoteForm';

import './less/editor.less';

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
    Transforms.insertNodes(editor, { ...footnote, children: [{ text: '' }] });
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
  const [node] = Editor.nodes(editor, { match: (n) => n.type === FOOTNOTE });
  return node;
};

export const updateFootnotesContextFromActiveFootnote = (
  editor,
  ctx,
  { saveSelection = true, clearIfNoActiveFootnote = true },
) => {
  if (saveSelection) {
    ctx.setSelection(editor.selection);
  }

  const note = getActiveFootnote(editor);
  // debugger;
  if (note) {
    const [node] = note;
    const { data, children } = node;

    const r = {
      ...data,
      // ...JSON.parse(JSON.stringify(footnote.getFormData())),
      // ...JSON.parse(
      //   JSON.stringify(data),
      // footnote: children?.[0]?.text,
    };

    // console.log('R is ', r);

    ctx.setFormData(r);
  } else if (clearIfNoActiveFootnote) {
    ctx.setFormData({});
  }
};

// export const handleFootnoteButtonClick = (
//   editor,
//   footnote,
//   saveSelection = true,
// ) => {
//   if (!footnote.getShowForm()) {
//     updateFootnotesContextFromActiveFootnote(editor, footnote, {
//       saveSelection,
//     });
//
//     footnote.setShowForm(true);
//   }
// };

// const PluginSidebar = ({ children, selected }) => {
//   return (
//     <>
//       {selected && (
//         <Portal
//           node={__CLIENT__ && document.getElementById('slate-plugin-sidebar')}
//         >
//           {children}
//         </Portal>
//       )}
//     </>
//   );
// };

// export default PluginSidebar;

const FootnoteButton = () => {
  const editor = useSlate();
  const intl = useIntl();

  // The following line of code is needed so that on any change of the context, the FootnoteButton is rerendered.
  // eslint-disable-next-line no-unused-vars
  // const footnoteCtx = React.useContext(FootnoteContext);

  const isFootnote = isActiveFootnote(editor);

  const footnoteRef = React.useRef(null);

  const [showEditForm, setShowEditForm] = React.useState(false);
  const [selection, setSelection] = React.useState(null);
  const [formData, setFormdata] = React.useState({});

  // TODO: use a new component: SidebarFootnoteForm

  const submitHandler = React.useCallback(
    (formData) => {
      // TODO: have an algorithm that decides which one is used
      if (formData.footnote) {
        // const sel = footnoteRef.current.getSelection();
        const sel = editor.selection; // should we save selection?
        if (Range.isRange(sel)) {
          Transforms.select(editor, sel);
          insertFootnote(editor, { ...formData });
        } else {
          Transforms.deselect(editor);
        }
      } else {
        unwrapFootnote(editor);
      }
    },
    [editor], // , footnoteRef
  );

  const PluginToolbar = React.useCallback(
    () => (
      <>
        <Button.Group>
          <Button
            icon
            basic
            aria-label={intl.formatMessage(messages.edit)}
            onMouseDown={() => {}}
          >
            <Icon name={editingSVG} size="18px" />
          </Button>
        </Button.Group>
        <Button.Group>
          <Button
            icon
            basic
            aria-label={intl.formatMessage(messages.delete)}
            onMouseDown={() => {
              unwrapFootnote(editor);
            }}
          >
            <Icon name={clearSVG} size="18px" />
          </Button>
        </Button.Group>
      </>
    ),
    [editor, intl],
  );

  const footnote = getActiveFootnote(editor);

  const { setPluginToolbar, setShowPluginToolbar } = editor;

  // const setToolbar = useToolbar(editor);
  // setToolbar(PluginToolbar);

  React.useEffect(() => {
    if (isFootnote && !isEqual(footnote, footnoteRef.current)) {
      footnoteRef.current = footnote;
      if (footnoteRef.current) {
        // setShowPluginToolbar(true);
        setPluginToolbar(PluginToolbar);
      }
      // else {
      //   setPluginToolbar(null);
      // }
    } else if (!isFootnote) {
      footnoteRef.current = null;
      setPluginToolbar(null);
    }
  }, [
    PluginToolbar,
    footnote,
    isFootnote,
    setPluginToolbar,
    setShowPluginToolbar,
  ]);

  // handleFootnoteButtonClick(editor, footnote);
  // handleFootnoteButtonClick(editor, footnote);

  return (
    <>
      {/* <SidebarPopup selected={showEditForm()}> */}
      {/*   <InlineForm */}
      {/*     schema={FootnoteSchema} */}
      {/*     title={FootnoteSchema.title} */}
      {/*     icon={<VoltoIcon size="24px" name={briefcaseSVG} />} */}
      {/*     onChangeField={(id, value) => { */}
      {/*       footnote.setFormData({ */}
      {/*         ...footnote.getFormData(), */}
      {/*         [id]: value, */}
      {/*       }); */}
      {/*     }} */}
      {/*     formData={footnote.getFormData()} */}
      {/*     headerActions={ */}
      {/*       <> */}
      {/*         <button */}
      {/*           onClick={() => { */}
      {/*             footnote.setShowForm(false); */}
      {/*             submitHandler(footnote.getFormData()); */}
      {/*             ReactEditor.focus(editor); */}
      {/*           }} */}
      {/*         > */}
      {/*           <VoltoIcon size="24px" name={checkSVG} /> */}
      {/*         </button> */}
      {/*         <button */}
      {/*           onClick={() => { */}
      {/*             footnote.setShowForm(false); */}
      {/*             unwrapFootnote(editor); */}
      {/*             ReactEditor.focus(editor); */}
      {/*           }} */}
      {/*         > */}
      {/*           <VoltoIcon size="24px" name={formatClearSVG} /> */}
      {/*         </button> */}
      {/*         <button */}
      {/*           onClick={() => { */}
      {/*             footnote.setShowForm(false); */}
      {/*             ReactEditor.focus(editor); */}
      {/*           }} */}
      {/*         > */}
      {/*           <VoltoIcon size="24px" name={clearSVG} /> */}
      {/*         </button> */}
      {/*       </> */}
      {/*     } */}
      {/*   /> */}
      {/* </SidebarPopup> */}

      <ToolbarButton
        active={isFootnote}
        onMouseDown={() => {
          // console.log(editor.showPluginToolbar);
        }}
        icon={tagSVG}
      />
    </>
  );
};

export default FootnoteButton;
