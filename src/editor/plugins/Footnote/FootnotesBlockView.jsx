import {
  getBlocksFieldname,
  getBlocksLayoutFieldname
} from '@plone/volto/helpers';
import React from 'react';
import { Node } from 'slate';
import { FOOTNOTE } from './constants';

const getBlocks = (properties) => {
  const blocksFieldName = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);
  return properties[blocksLayoutFieldname].items.map(
    (n) => properties[blocksFieldName][n],
  );
};

const FootnotesBlockView = (props) => {
  const { data, properties } = props;
  const { title } = data;

  // console.log(properties);
  const blocks = getBlocks(properties);
  const footnotes = [];
  // TODO: slice the blocks according to existing footnote listing blocks.
  // A footnote listing block should reset the counter of the footnotes above it
  // If so, then it should only include the footnotes between the last footnotes listing block and this block
  blocks
    .filter((b) => b['@type'] === 'slate')
    .forEach(({ value }) => {
      if (!value) return;

      Array.from(Node.elements(value[0])).forEach(([node]) => {
        if (node.type === FOOTNOTE) {
          footnotes.push(node);
        }
      });
    });
  const makeFootnote = (footnote) => {
    const free = footnote.replace('<?xml version="1.0"?>', '');

    return free;
  };

  return (
    <div className="footnotes-listing-block">
      <h3>References:{title}</h3>
      {footnotes && (
        <ol>
          {footnotes.map(({ data }) => {
            const { uid, footnote } = data;
            return (
              <li key={uid} id={`footnote-${uid}`}>
                {/* {makeFootnote(footnote, uid)} */}

                {/* {footnoteLink ? (
                  <a href={footnoteLink} aria-label={footnoteLink}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: makeFootnote(footnote),
                      }}
                    />
                  </a>
                ) : (
                  footnote
                )} */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: makeFootnote(footnote),
                  }}
                />
                <a href={`#ref-${uid}`} aria-label="Back to content">
                  ↵
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default FootnotesBlockView;
