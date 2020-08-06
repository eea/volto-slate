import React from 'react';
import { Popup } from 'semantic-ui-react';
import './public.less';
const makeFootnote = (footnote) => {
  const free = footnote.replace('<?xml version="1.0"?>', '');

  return free;
};

export const FootnoteElement = ({ attributes, children, element, mode }) => {
  const { data = {} } = element;
  const { uid = 'undefined' } = data;

  return (
    <>
      {mode === 'view' ? (
        <Popup
          trigger={
            <a
              href={`#footnote-${uid}`}
              id={`ref-${uid}`}
              aria-describedby="footnote-label"
            >
              {children}
            </a>
          }
        >
          <Popup.Content>
            <div
              dangerouslySetInnerHTML={{
                __html: makeFootnote(data.footnote),
              }}
            />{' '}
          </Popup.Content>
        </Popup>
      ) : (
        <span {...attributes} className="footnote">
          {children}
        </span>
      )}
    </>
  );
};
