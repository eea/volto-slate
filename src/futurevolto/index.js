import { ObjectBrowserWidgetMode } from '@plone/volto/components/manage/Widgets/ObjectBrowserWidget';

export default (config) => {
  config.widgets.widget.object_browser = ObjectBrowserWidgetMode('link');
  return config;
};
