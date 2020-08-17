import React from 'react';
import { Popup } from 'semantic-ui-react';

import './less/public.less';

export const FootnoteElement = ({ attributes, children, element, mode }) => {
  const { data = {} } = element;
  const { uid = 'undefined' } = data;

  return (
    <>
      {mode === 'view' ? (
        <a
          href={`#footnote-${uid}`}
          id={`ref-${uid}`}
          aria-describedby="footnote-label"
        >
          {children}
        </a>
      ) : (
        <Popup
          content={data.footnote}
          header="Footnote"
          position="bottom left"
          trigger={
            <span {...attributes} className="footnote footnote-edit-node">
              {children}
            </span>
          }
        />
      )}
    </>
  );
};
