import isUrl from 'is-url';
import imageExtensions from 'image-extensions';
// import { ReactEditor } from 'slate-react';
import { Transforms } from 'slate';

export const isImageUrl = (url) => {
  if (!isUrl(url)) return false;

  const ext = new URL(url).pathname.split('.').pop();

  return imageExtensions.includes(ext);
};

export const onImageLoad = (editor, reader) => () => {
  const url = reader.result;
  if (url) insertImage(editor, url);
};

export const insertImage = (editor, url, { typeImg = 'image' } = {}) => {
  const text = { text: '' };
  const image = { type: typeImg, url, children: [text] };
  Transforms.insertNodes(editor, image);
};

/**
 * Allows for pasting images from clipboard.
 * Not yet: dragging and dropping images, selecting them through a file system dialog.
 * @param typeImg
 */
export const withImage = (editor) => {
  const { isVoid, insertData } = editor;

  editor.isVoid = (element) => {
    return element.type === 'image' ? true : isVoid(element);
  };

  editor.insertData = (data) => {
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
      insertData(data);
    }
  };

  return editor;
};
