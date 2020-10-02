// The default behavior is to allow images to be copy/pasted inside the editor
// The TextBlockEdit extensions will come and then split the images into
// separate dedicated Volto image blocks.

import isUrl from 'is-url';
import imageExtensions from 'image-extensions';
import { Editor } from 'slate';
import { IMAGE } from 'volto-slate/constants';
import { jsx } from 'slate-hyperscript';
import { getBaseUrl } from '@plone/volto/helpers';
import { v4 as uuid } from 'uuid';

export const isImageUrl = (url) => {
  if (!isUrl(url)) return false;

  const ext = new URL(url).pathname.split('.').pop();

  return imageExtensions.includes(ext);
};

/**
 * @param {Editor} editor
 * @param {FileReader} reader
 * @param {Function} resolve Must be called after the image loading is
 * completely handled (e.g. after inserting the respective image into the
 * editor)
 */
export const onImageLoad = (editor, reader, resolve) => {
  return () => {
    const data = reader.result;

    // if (url) insertImage(editor, url);
    const fields = data.match(/^data:(.*);(.*),(.*)$/);
    const blockProps = editor.getBlockProps();
    const {
      block,
      createContent,
      pathname,
      onDeleteBlock,
      properties,
      index,
    } = blockProps;

    console.log('blockProps', blockProps);

    // TODO: we need a way to get the uploaded image URL
    // This would be easier if we would have block transformers-based image
    // blocks
    const url = getBaseUrl(pathname);
    const uploadId = uuid();
    const uploadFileName = `clipboard-${uploadId}`;
    const uploadTitle = `Clipboard image`;
    const content = {
      '@type': 'Image',
      title: uploadTitle,
      image: {
        data: fields[3],
        encoding: fields[2],
        'content-type': fields[1],
        filename: uploadFileName,
      },
    };

    // resolve();

    function doResolve() {
      // TODO: use the object 'blocks_layout' also when it is called something else
      onDeleteBlock(properties.blocks_layout.items[index + 1]).then(() => {
        resolve();
      });
    }

    createContent(url, content, block)
      .then((data) => {
        doResolve();
      })
      .catch(() => {
        doResolve();
      });
  };
};

export const deserializeImageTag = (editor, el) => {
  const attrs = { type: IMAGE };

  for (const name of el.getAttributeNames()) {
    attrs[name] = el.getAttribute(name);
  }
  return [jsx('element', attrs, [{ text: '' }])];
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
    // const text = data.getData('text/plain');
    const { files } = data;
    if (files && files.length > 0) {
      return new Promise((resolve, reject) => {
        for (const file of files) {
          const reader = new FileReader();
          const [mime] = file.type.split('/');
          if (mime === 'image') {
            reader.addEventListener(
              'load',
              onImageLoad(editor, reader, resolve),
            );
            reader.readAsDataURL(file);
          }
        }
      });
    } else {
      insertData(data);
    }
  };

  return editor;
};
