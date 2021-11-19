import React from 'react';
import { Editor, Transforms, Range, Text } from 'slate';

export function isMarkActive(editor, format) {
  // TODO: this implementation is not ok. LibreOffice Writer only shows
  // mark button as active if the mark is applied to the entire selected range
  // Here, it seems, the mark doesn't need to cover the entire selection,
  // which is wrong
  let marks;
  try {
    marks = Editor.marks(editor);
  } catch (ex) {
    // bug in Slate, recently appears only in Cypress context, more exactly when I press Enter inside a numbered list first item to produce a split (resulting two list items) (not sure if manually inside the Cypress browser but automatically it surely appears)
    // if (
    //   ex.message ===
    //   'Cannot get the leaf node at path [0,0] because it refers to a non-leaf node: [object Object]' // also with [0,1]
    // ) {
    marks = null;
    // } else {
    //   throw ex;
    // }
  }
  return marks ? marks[format] === true : false;
}

/**
 * Taken from Slate.js without any reason that is still relevant now:
 * https://github.com/ianstormtaylor/slate/blob/3ad3aaccad5b3aae335eea21e03866e2c266f5a6/packages/slate/src/create-editor.ts#L92-L114
 *
 * @param {Editor} editor
 * @param {string} key
 * @param {any} value
 */
function addMark(editor, key, value) {
  const { selection } = editor;

  if (selection) {
    if (Range.isExpanded(selection)) {
      Transforms.setNodes(
        editor,
        { [key]: value },
        {
          match: (node) => {
            // TODO: why to use this transform for void nodes too?
            // || editor.isVoid(node)
            return Text.isText(node);
          },
          split: true,
        },
      );
    } else {
      const marks = {
        ...(Editor.marks(editor) || {}),
        [key]: value,
      };

      editor.marks = marks;

      // TODO: I think I am unable to access FLUSHING here
      // if (!FLUSHING.get(editor)) {
      editor.onChange();
      // }
    }
  }
}

export function toggleMark(editor, format) {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    // don't apply marks inside inlines (such as footnote) because
    // that splits the footnote into multiple footnotes
    addMark(editor, format, true);
    // if (isSelectionInline(editor)) {
    //   addMark(editor, format, true);
    // }
  }
}

/*
 * Replaces inline text elements with a wrapper result
 *
 */
export function wrapInlineMarkupText(children, wrapper) {
  if (typeof children === 'string') {
    return children ? wrapper(children) : null;
  }

  // TODO: find the deepest child that needs to be replaced.
  // TODO: note: this might trigger warnings about keys
  if (Array.isArray(children)) {
    return children.map((child, index) => {
      if (typeof child === 'string' && child) {
        return wrapper(children);
      } else {
        return React.cloneElement(
          child,
          child.props,
          wrapInlineMarkupText(child.props.children, wrapper),
        );
      }
    });
  } else {
    return React.cloneElement(
      children,
      children.props,
      wrapInlineMarkupText(children.props.children, wrapper),
    );
  }
}
