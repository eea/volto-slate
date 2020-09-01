import { Editor, Transforms } from 'slate';
import { settings } from '~/config';
import { deconstructToVoltoBlocks } from 'volto-slate/utils';

export function createEmptyParagraph() {
  // TODO: rename to createEmptyBlock
  return {
    type: settings.slate.defaultBlockType,
    children: [{ text: '' }],
  };
}

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  return !!match;
};

export const isBlockStyleActive = (editor, style) => {
  const sn = Array.from(
    Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && typeof n.styleName === 'string',
      mode: 'highest',
    }),
  );

  for (const [n] of sn) {
    if (n.styleName.split(' ').filter((x) => x === style).length > 0) {
      return true;
    }
  }

  return false;
};

export const isInlineStyleActive = (editor, style) => {
  const m = Editor.marks(editor);
  if (
    m &&
    m.styleName &&
    m.styleName.split(' ').filter((x) => x === style).length > 0
  ) {
    return true;
  }
  return false;
};

export const toggleFormat = (editor, format) => {
  const { slate } = settings;
  const isActive = isBlockActive(editor, format);
  const type = isActive ? slate.defaultBlockType : format;
  Transforms.setNodes(editor, {
    type,
  });
};

export const internalToggleBlockStyle = (editor, style) => {
  // const isActive = isBlockStyleActive(editor, style);
  // style = isActive ? undefined : style;
  // Transforms.setNodes(editor, {
  //   styleName: style,
  // });
  toggleBlockStyleInSelection(editor, style);
};

export const internalToggleInlineStyle = (editor, style) => {
  // const isActive = isInlineStyleActive(editor, style);
  // if (isActive) {
  //   Editor.removeMark(editor, 'styleName');
  // } else {
  //   Editor.addMark(editor, 'styleName', style);
  // }
  toggleInlineStyleInSelection(editor, style);
};

export const toggleInlineFormat = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  if (isActive) {
    Transforms.unwrapNodes(editor, {
      match: (n) => n.type === format,
      split: false,
    });
    return;
  }
  const block = { type: format, children: [] };
  Transforms.wrapNodes(editor, block, { split: true });
};

export const changeBlockToList = (editor, format) => {
  const { slate } = settings;
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === slate.listItemType,
  });

  if (!match) {
    Transforms.setNodes(editor, {
      type: slate.listItemType,
      // id: nanoid(8),
    });
  }
  const block = { type: format, children: [] };
  Transforms.wrapNodes(editor, block);
};

/*
 * Applies a block format unto a list item. Will split the list and deconstruct the
 * block
 */
export const toggleFormatAsListItem = (editor, format) => {
  const { slate } = settings;
  Transforms.unwrapNodes(editor, {
    match: (n) => slate.listTypes.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: format,
  });

  deconstructToVoltoBlocks(editor);
};

/*
 * Applies a block format unto a list item. Will split the list and deconstruct the
 * block
 */
export const toggleBlockStyleAsListItem = (editor, style) => {
  const { slate } = settings;
  Transforms.unwrapNodes(editor, {
    match: (n) => slate.listTypes.includes(n.type),
    split: true,
  });

  toggleBlockStyleInSelection(editor, style);

  deconstructToVoltoBlocks(editor);
};

/*
 * Applies an inline style unto a list item.
 */
export const toggleInlineStyleAsListItem = (editor, style) => {
  // const { slate } = settings;
  // Transforms.unwrapNodes(editor, {
  //   match: (n) => slate.listTypes.includes(n.type),
  //   split: true,
  // });
  toggleInlineStyleInSelection(editor, style);
  // Transforms.setNodes(editor, {
  //   styleName: style,
  // });

  // deconstructToVoltoBlocks(editor);
};

/*
 * Toggles between list types by exploding the block
 */
export const switchListType = (editor, format) => {
  const { slate } = settings;
  Transforms.unwrapNodes(editor, {
    match: (n) => slate.listTypes.includes(n.type),
    split: true,
  });
  const block = { type: format, children: [] };
  Transforms.wrapNodes(editor, block);

  deconstructToVoltoBlocks(editor);
};

export const toggleBlock = (editor, format) => {
  // We have 6 boolean variables which need to be accounted for.
  // See https://docs.google.com/spreadsheets/d/1mVeMuqSTMABV2BhoHPrPAFjn7zUksbNgZ9AQK_dcd3U/edit?usp=sharing
  const { slate } = settings;
  const { listTypes } = slate;

  const isListItem = isBlockActive(editor, slate.listItemType);
  const isActive = isBlockActive(editor, format);
  const wantsList = listTypes.includes(format);

  if (isListItem && !wantsList) {
    toggleFormatAsListItem(editor, format);
  } else if (isListItem && wantsList && !isActive) {
    switchListType(editor, format); // this will deconstruct to Volto blocks
  } else if (!isListItem && wantsList) {
    changeBlockToList(editor, format);
  } else if (!isListItem && !wantsList) {
    toggleFormat(editor, format);
  } else {
    console.warn('toggleBlock case not covered, please examine:', {
      wantsList,
      isActive,
      isListItem,
    });
  }
};

export const toggleBlockStyle = (editor, style) => {
  // We have 6 boolean variables which need to be accounted for.
  // See https://docs.google.com/spreadsheets/d/1mVeMuqSTMABV2BhoHPrPAFjn7zUksbNgZ9AQK_dcd3U/edit?usp=sharing
  const { slate } = settings;

  const isListItem = isBlockActive(editor, slate.listItemType);
  const isActive = isBlockStyleActive(editor, style);
  const wantsList = false;

  if (isListItem && !wantsList) {
    toggleBlockStyleAsListItem(editor, style);
  } else if (isListItem && wantsList && !isActive) {
    // switchListType(editor, format); // this will deconstruct to Volto blocks
  } else if (!isListItem && wantsList) {
    // changeBlockToList(editor, format);
  } else if (!isListItem && !wantsList) {
    internalToggleBlockStyle(editor, style);
  } else {
    console.warn('toggleBlockStyle case not covered, please examine:', {
      wantsList,
      isActive,
      isListItem,
    });
  }
};

export const toggleInlineStyle = (editor, style) => {
  // We have 6 boolean variables which need to be accounted for.
  // See https://docs.google.com/spreadsheets/d/1mVeMuqSTMABV2BhoHPrPAFjn7zUksbNgZ9AQK_dcd3U/edit?usp=sharing
  const { slate } = settings;

  const isListItem = isBlockActive(editor, slate.listItemType);
  const isActive = isInlineStyleActive(editor, style);
  const wantsList = false;

  if (isListItem && !wantsList) {
    toggleInlineStyleAsListItem(editor, style);
  } else if (isListItem && wantsList && !isActive) {
    // switchListType(editor, format); // this will deconstruct to Volto blocks
  } else if (!isListItem && wantsList) {
    // changeBlockToList(editor, format);
  } else if (!isListItem && !wantsList) {
    internalToggleInlineStyle(editor, style);
  } else {
    console.warn('toggleInlineStyle case not covered, please examine:', {
      wantsList,
      isActive,
      isListItem,
    });
  }
};

function toggleInlineStyleInSelection(editor, style) {
  const m = Editor.marks(editor);
  if (
    m &&
    m.styleName &&
    m.styleName.split(' ').filter((x) => x === style).length > 0
  ) {
    // remove the style
    Editor.addMark(
      editor,
      'styleName',
      m.styleName
        .split(' ')
        .filter((x) => x !== style)
        .join(' '),
    );
    return;
  }
  // add a new style
  Editor.addMark(
    editor,
    'styleName',
    m && m.styleName
      ? m.styleName + ' ' + style
      : m && !m.styleName
      ? style
      : '',
  );
}

function toggleBlockStyleInSelection(editor, style) {
  const sn = Array.from(
    Editor.nodes(editor, {
      mode: 'highest',
      match: (n) => {
        return !Editor.isEditor(n);
      },
    }),
  );

  for (const [n, p] of sn) {
    let cn = n.styleName;
    if (typeof n.styleName !== 'string') {
      cn = style;
    } else if (n.styleName.split(' ').filter((x) => x === style).length > 0) {
      cn = cn
        .split(' ')
        .filter((x) => x !== style)
        .join(' ');
    } else {
      // the style is not set but other styles are set
      cn = cn.split(' ').concat(style).join(' ');
    }
    Transforms.setNodes(editor, { styleName: cn }, { at: p });
  }
}
