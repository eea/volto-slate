import React from 'react';
import { makeInlineElementPlugin } from 'volto-slate/components/ElementEditor';
import { SIMPLELINK, LINK } from 'volto-slate/constants';
import { LinkElement } from './render';
import { defineMessages } from 'react-intl'; // , defineMessages
import { withSimpleLink } from './extensions';
import { useSelector, useDispatch } from 'react-redux';
import { setPluginOptions } from 'volto-slate/actions';
import { FixedToolbar } from 'volto-slate/editor/ui';
import { ReactEditor } from 'slate-react';
import { Transforms } from 'slate';
import linkSVG from '@plone/volto/icons/link.svg';
import AddLinkForm from '@plone/volto/components/manage/AnchorPlugin/components/LinkButton/AddLinkForm';

const linkDeserializer = () => {};

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

const SimpleLinkEditor = (props) => {
  // console.log('simple', props);
  const { editor, pluginId, getActiveElement } = props;
  const showEditor = useSelector((state) => {
    return state['slate_plugins']?.[pluginId]?.show_sidebar_editor;
  });

  // const showEditor = React.useState(false);
  // editor.isSidebarOpen = showEditor && active;

  const dispatch = useDispatch();

  const selection = JSON.parse(JSON.stringify(editor.selection));
  const active = getActiveElement(editor);

  // Hide the editor when switching to another text element
  React.useEffect(() => {
    if (!active)
      dispatch(setPluginOptions(pluginId, { show_sidebar_editor: false }));
  }, [active, dispatch, pluginId]);

  return showEditor && active ? (
    <FixedToolbar className="add-link">
      <AddLinkForm
        block="draft-js"
        placeholder={'Add link'}
        data={{ url: '' }}
        onChangeValue={(url) => {
          dispatch(setPluginOptions(pluginId, { show_sidebar_editor: false }));
          editor.savedSelection = selection;
          editor.selection = selection;
          ReactEditor.focus(editor);
        }}
        onClear={() => {
          console.log('clear');
        }}
        onOverrideContent={(c) => {
          console.log('on overridden', c);
        }}
      />
    </FixedToolbar>
  ) : (
    ''
  );
};

export default (config) => {
  const { slate } = config.settings;

  const PLUGINID = SIMPLELINK;

  slate.toolbarButtons = slate.toolbarButtons.filter((b) => b !== LINK);
  slate.toolbarButtons = slate.toolbarButtons.slice(0, 2).concat([PLUGINID]);
  slate.expandedToolbarButtons = slate.expandedToolbarButtons.filter(
    (b) => b !== LINK,
  );

  slate.htmlTagsToSlate.A = linkDeserializer;

  const opts = {
    title: 'SimpleLink',
    pluginId: PLUGINID,
    elementType: PLUGINID,
    element: LinkElement,
    isInlineElement: true,
    // editSchema: LinkEditSchema,
    extensions: [withSimpleLink],
    hasValue: (formData) => !!formData.link,
    toolbarButtonIcon: linkSVG,
    usePersistentHelper: false,
    persistentHelper: (pluginOptions) => (props) => (
      <SimpleLinkEditor {...props} {...pluginOptions} />
    ),
    messages,
  };

  const [installLinkEditor] = makeInlineElementPlugin(opts);
  config = installLinkEditor(config);

  return config;
};
