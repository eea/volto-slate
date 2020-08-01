import ObjectWidget from './ObjectWidget';
import ObjectBrowserWidget from '@plone/volto/components/manage/Widgets/ObjectBrowserWidget';

export default (config) => {
  config.widgets.widget.object = ObjectWidget;
  config.widgets.widget.object_browser = ObjectBrowserWidget;
  return config;
};
