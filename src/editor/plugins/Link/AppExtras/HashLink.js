import React from 'react';
import { withRouter } from 'react-router';
import { withHashLink } from 'volto-slate/hooks';

import config from '@plone/volto/registry';

const HashLink = ({
  data,
  history,
  pathname,
  hashlink,
  resetHashLink,
  ...props
}) => {
  const { settings } = config;
  const blacklist = settings.hashlinkBlacklist || [];
  const id = hashlink.hash;
  const type = hashlink.data.type || '';

  React.useEffect(() => {
    const unlisten = history.listen((location) => {
      if (location.pathname !== pathname) {
        resetHashLink();
      }
    });
    return () => {
      unlisten();
    };
    /* eslint-disable-next-line */
  }, []);

  React.useEffect(() => {
    if (hashlink.counter > 0 && blacklist.indexOf(type) === -1) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    /* eslint-disable-next-line */
  }, [hashlink.counter]);

  return <React.Fragment />;
};

export default withRouter(withHashLink(HashLink));
