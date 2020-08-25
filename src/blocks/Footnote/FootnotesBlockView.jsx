import React from 'react';
import { Node } from 'slate';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import './less/public.less';
import { settings } from '~/config';

/**
 * @param {object} properties A prop received by the View component
 * `FootnotesBlockView` which is read by the `getBlocksFieldname` and
 * `getBlocksLayoutFieldname` Volto helpers to produce the return value.
 * @returns {Array} The blocks data taken from the Volto form.
 */
const getBlocks = (properties) => {
  const blocksFieldName = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);
  return properties[blocksLayoutFieldname].items.map(
    (n) => properties[blocksFieldName][n],
  );
};

/**
 * @summary The React component that displays the list of footnotes inserted
 * before in the current page.
 * @param {object} props Contains the properties `data` and `properties` as
 * received from the Volto form.
 */
const FootnotesBlockView = (props) => {
  const { data, properties } = props;
  const { title } = data;
  const { footnotes } = settings;

  // console.log(properties);
  const blocks = getBlocks(properties);
  const notes = [];
  // TODO: slice the blocks according to existing footnote listing blocks. A
  // footnote listing block should reset the counter of the footnotes above it
  // If so, then it should only include the footnotes between the last footnotes
  // listing block and this block
  blocks
    .filter((b) => b['@type'] === 'slate')
    .forEach(({ value }) => {
      if (!value) return;

      Array.from(Node.elements(value[0])).forEach(([node]) => {
        if (footnotes.includes(node.type)) {
          notes.push(node);
        }
      });
    });

  return (
    <div className="footnotes-listing-block">
      <h3>{title}</h3>
      {notes && (
        <ol>
          {notes.map(({ data }) => {
            const { uid, footnote } = data;
            return (
              <li key={uid} id={`footnote-${uid}`}>
                {footnote}
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
