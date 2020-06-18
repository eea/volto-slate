import ObjectWidget from './ObjectWidget';
import ObjectBrowserWidget from '@plone/volto/components/manage/Widgets/ObjectBrowserWidget';

const install = (config) => {
  config.widgets.widget.object = ObjectWidget;
  config.widgets.widget.object_browser = ObjectBrowserWidget;
  return config;
};

export default install;
