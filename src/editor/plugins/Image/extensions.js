// The default behavior is to allow images to be copy/pasted inside the editor
// The TextBlockEdit extensions will come and then split the images into
// separate dedicated Volto image blocks.

import isUrl from 'is-url';
import imageExtensions from 'image-extensions';
import { Transforms } from 'slate';
import { IMAGE } from './constants';
import { jsx } from 'slate-hyperscript';

export const isImageUrl = (url) => {
  if (!isUrl(url)) return false;

  const ext = new URL(url).pathname.split('.').pop();

  return imageExtensions.includes(ext);
};

export const onImageLoad = (editor, reader) => () => {
  const url = reader.result;
  if (url) insertImage(editor, url);
};

export const insertImage = (editor, url, { typeImg = IMAGE } = {}) => {
  const image = { type: typeImg, url, children: [{ text: '' }] };
  Transforms.insertNodes(editor, image);
};

export const deserializeImageTag = (editor, el) => {
  const attrs = { type: IMAGE };

  for (const name of el.getAttributeNames()) {
    attrs[name] = el.getAttribute(name);
  }
  return jsx('element', attrs, [{ text: '' }]);
};

/**
 * Allows for pasting images from clipboard.
 * Not yet: dragging and dropping images, selecting them through a file system dialog.
 * @param typeImg
 */
export const withImage = (editor) => {
  const { insertData, isVoid, isInline } = editor;

  editor.isVoid = (element) => {
    return element.type === IMAGE ? true : isVoid(element);
  };

  // If it's not marked as inline, Slate will strip the {type:'img"} nodes when
  // it finds them next to {text: ''} nodes
  editor.isInline = (element) => {
    return element.type === IMAGE ? true : isInline(element);
  };

  editor.htmlTagsToSlate = {
    ...editor.htmlTagsToSlate,
    IMG: deserializeImageTag,
  };

  editor.insertData = (data) => {
    console.log('image insertData');
    const text = data.getData('text/plain');
    const { files } = data;
    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split('/');
        if (mime === 'image') {
          reader.addEventListener('load', onImageLoad(editor, reader));
          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      // console.log('regular data insert');
      insertData(data);
    }
  };

  return editor;
};
