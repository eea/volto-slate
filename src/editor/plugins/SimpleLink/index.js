import React from 'react';
import { useSlate } from 'slate-react';
import {
  _insertElement,
  _unwrapElement,
  _isActiveElement,
  _getActiveElement,
} from 'volto-slate/components/ElementEditor/utils';
import { SIMPLELINK, LINK } from 'volto-slate/constants';
import { LinkElement } from './render';
import { defineMessages } from 'react-intl'; // , defineMessages
import { withSimpleLink } from './extensions';
import { useSelector, useDispatch } from 'react-redux';
import { setPluginOptions } from 'volto-slate/actions';
import { PositionedToolbar } from 'volto-slate/editor/ui';
import { ReactEditor } from 'slate-react';
import linkSVG from '@plone/volto/icons/link.svg';
import unlinkSVG from '@plone/volto/icons/unlink.svg';
import AddLinkForm from '@plone/volto/components/manage/AnchorPlugin/components/LinkButton/AddLinkForm';
import { ToolbarButton as UIToolbarButton } from 'volto-slate/editor/ui';

const linkDeserializer = () => {};

const messages = defineMessages({
  add: {
    id: 'Add link',
    defaultMessage: 'Add link',
  },
  edit: {
    id: 'Edit link',
    defaultMessage: 'Edit link',
  },
});

function getPositionStyle(el) {
  const domSelection = window.getSelection();
  if (domSelection.rangeCount < 1) {
    return {};
  }
  const domRange = domSelection.getRangeAt(0);
  const rect = domRange.getBoundingClientRect();

  return {
    style: {
      opacity: 1,
      top: rect.top + window.pageYOffset - 6,
      left: rect.left + window.pageXOffset + rect.width / 2,
    },
  };
}

const SimpleLinkEditor = (props) => {
  const {
    editor,
    pluginId,
    getActiveElement,
    unwrapElement,
    insertElement,
  } = props;
  const showEditor = useSelector((state) => {
    return state['slate_plugins']?.[pluginId]?.show_sidebar_editor;
  });
  const savedPosition = React.useRef();

  const dispatch = useDispatch();

  const active = getActiveElement(editor);
  const [node] = active || [];

  if (showEditor && !savedPosition.current) {
    savedPosition.current = getPositionStyle();
  }

  return showEditor ? ( //  && active
    <PositionedToolbar className="add-link" position={savedPosition.current}>
      <AddLinkForm
        block="draft-js"
        placeholder={'Add link'}
        data={{ url: node?.data?.url || '' }}
        theme={{}}
        onChangeValue={(url) => {
          // console.log('change value', url);
          if (!active) {
            insertElement(editor, { url });
          } else {
            const selection = unwrapElement(editor);
            editor.selection = selection;
            insertElement(editor, { url });
          }
          ReactEditor.focus(editor);
          dispatch(setPluginOptions(pluginId, { show_sidebar_editor: false }));
        }}
        onClear={() => {
          unwrapElement(editor);
          // editor.savedSelection = undefined;
          // editor.selection = selection;
          // ReactEditor.focus(editor);
          // dispatch(setPluginOptions(pluginId, { show_sidebar_editor: false }));
          // console.log('clear');
        }}
        onOverrideContent={(c) => {
          // console.log('override', c);
          // editor.savedSelection = undefined;
          dispatch(setPluginOptions(pluginId, { show_sidebar_editor: false }));
        }}
      />
    </PositionedToolbar>
  ) : (
    ''
  );
};

export default (config) => {
  const { slate } = config.settings;

  const PLUGINID = SIMPLELINK;

  const linkBtnIndex = slate.toolbarButtons.findIndex((b) => b === LINK);
  slate.expandedToolbarButtons = slate.expandedToolbarButtons.filter(
    (b) => b !== LINK,
  );

  const insertElement = _insertElement(PLUGINID);
  const getActiveElement = _getActiveElement(PLUGINID);
  const isActiveElement = _isActiveElement(PLUGINID);
  const unwrapElement = _unwrapElement(PLUGINID);

  const ToolbarButton = (props) => {
    const dispatch = useDispatch();
    const editor = useSlate();
    const isElement = isActiveElement(editor);

    return (
      <UIToolbarButton
        title={isElement ? messages.edit : messages.add}
        icon={isElement ? unlinkSVG : linkSVG}
        active={isElement}
        onMouseDown={() => {
          // if (!isElement) insertElement(editor, {});
          editor.savedSelection = JSON.parse(JSON.stringify(editor.selection));
          dispatch(setPluginOptions(PLUGINID, { show_sidebar_editor: true }));
        }}
      />
    );
  };

  const pluginOptions = {
    insertElement,
    getActiveElement,
    isActiveElement,
    unwrapElement,
  };

  slate.buttons[PLUGINID] = ToolbarButton;
  slate.toolbarButtons[linkBtnIndex] = PLUGINID;
  slate.htmlTagsToSlate.A = linkDeserializer;
  slate.extensions.push(withSimpleLink);
  slate.elements[PLUGINID] = LinkElement;
  slate.nodeTypesToHighlight.push(PLUGINID);
  slate.persistentHelpers.push((props) => (
    <SimpleLinkEditor {...props} pluginId={PLUGINID} {...pluginOptions} />
  ));

  return config;
};
