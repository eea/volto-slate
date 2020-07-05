import React from 'react';
import { Editor, Range, Transforms } from 'slate';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
} from '@plone/volto/helpers';
import { FOOTNOTE } from './constants';

const getBlocks = (properties) => {
  const blocksFieldName = getBlocksFieldname(properties);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(properties);
  return properties[blocksLayoutFieldname].items.map(
    (n) => properties[blocksFieldName][n],
  );
};

const FootnotesBlockView = (props) => {
  const { properties } = props;

  const blocks = getBlocks(properties);
  const footnotes = [];
  blocks
    .filter((b) => b['@type'] === 'slate')
    .forEach(({ value }) => {
      if (!value) return;
      const nodes = Editor.nodes(value, {
        match: (n) => n.type === FOOTNOTE,
      });
      console.log('footnotes', Array.from(nodes), value);
    });
  return <div>Footnotes</div>;
};

export default FootnotesBlockView;
