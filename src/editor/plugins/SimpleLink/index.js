import { makeInlineElementPlugin } from 'volto-slate/components/ElementEditor';
import { SIMPLELINK, LINK } from 'volto-slate/constants';
import { LinkElement } from './render';
import { defineMessages } from 'react-intl'; // , defineMessages
import { withSimpleLink } from './extensions';
import linkSVG from '@plone/volto/icons/link.svg';

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
    messages,
  };

  const [installLinkEditor] = makeInlineElementPlugin(opts);
  config = installLinkEditor(config);

  return config;
};
