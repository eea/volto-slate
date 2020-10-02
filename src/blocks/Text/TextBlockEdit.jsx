import React from 'react';
import { connect } from 'react-redux';
import { readAsDataURL } from 'promise-file-reader';
import Dropzone from 'react-dropzone';

import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
import { Button, Dimmer, Loader, Message, Segment } from 'semantic-ui-react';

import { Icon, BlockChooser, SidebarPortal } from '@plone/volto/components';
import { flattenToAppURL, getBaseUrl } from '@plone/volto/helpers';
import { settings } from '~/config';

import { saveSlateBlockSelection } from 'volto-slate/actions';
import { SlateEditor } from 'volto-slate/editor';
import { serializeNodesToText } from 'volto-slate/editor/render';
import { createImageBlock, parseDefaultSelection } from 'volto-slate/utils';
import { createContent } from '@plone/volto/actions';
import { Transforms } from 'slate';

import ShortcutListing from './ShortcutListing';
import MarkdownIntroduction from './MarkdownIntroduction';
import { handleKey } from './keyboard';

import imageBlockSVG from '@plone/volto/components/manage/Blocks/Image/block-image.svg';
import addSVG from '@plone/volto/icons/circle-plus.svg';

import './css/editor.css';

import _ from 'lodash';

// TODO: refactor dropzone to separate component wrapper

const DEBUG = false;

const TextBlockEdit = (props) => {
  const {
    block,
    data,
    detached,
    index,
    onChangeBlock,
    onMutateBlock,
    onSelectBlock,
    pathname,
    properties,
    selected,
    createRequest,
    createContent,
    createdContent,
    defaultSelection,
    saveSlateBlockSelection,
    allowedBlocks,
    formTitle,
    formDescription,
  } = props;

  const { slate } = settings;
  const { textblockExtensions } = slate;
  const { value } = data;

  const [addNewBlockOpened, setAddNewBlockOpened] = React.useState();
  const [showDropzone, setShowDropzone] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [newImageId, setNewImageId] = React.useState(null);

  const prevReq = React.useRef(null);

  const withBlockProperties = React.useCallback(
    (editor) => {
      editor.getBlockProps = () => props;
      return editor;
    },
    [props],
  );

  const onDrop = React.useCallback(
    (files) => {
      // TODO: need to fix setUploading, treat uploading indicator
      // inteligently, show progress report on uploading files
      setUploading(true);
      files.forEach((file) => {
        const [mime] = file.type.split('/');
        if (mime !== 'image') return;

        readAsDataURL(file).then((data) => {
          const fields = data.match(/^data:(.*);(.*),(.*)$/);
          createContent(
            getBaseUrl(pathname),
            {
              '@type': 'Image',
              title: file.name,
              image: {
                data: fields[3],
                encoding: fields[2],
                'content-type': fields[1],
                filename: file.name,
              },
            },
            block,
          );
        });
      });
      setShowDropzone(false);
    },
    [pathname, createContent, block],
  );

  const { loaded, loading } = createRequest;
  const imageId = createdContent['@id'];
  const prevLoaded = prevReq.current;

  React.useLayoutEffect(() => {
    if (loaded && !loading && !prevLoaded && newImageId !== imageId) {
      const url = flattenToAppURL(imageId);
      setNewImageId(imageId);

      createImageBlock(url, index, props);
    }
    prevReq.current = loaded;
  }, [props, loaded, loading, prevLoaded, imageId, newImageId, index]);

  // This event handler unregisters itself after its first call.
  const handleClickOutside = React.useCallback((e) => {
    const blockChooser = document.querySelector('.blocks-chooser');
    document.removeEventListener('mousedown', handleClickOutside, false);
    if (doesNodeContainClick(blockChooser, e)) return;
    setAddNewBlockOpened(false);
  }, []);

  const handleUpdate = React.useCallback(
    (editor) => {
      // defaultSelection is used for things such as "restoring" the selection
      // when joining blocks or moving the selection to block start on block
      // split
      if (defaultSelection) {
        const selection = parseDefaultSelection(editor, defaultSelection);
        // console.log('SELECTION', selection);
        if (selection) {
          setTimeout(() => {
            try {
              Transforms.select(editor, selection);
              saveSlateBlockSelection(block, null);
            } catch (ex) {}
          }, 120);
          // without setTimeout, the join is not correct. Slate uses internally
          // a 100ms throttle, so setting to a bigger value seems to help
        }
      }
    },
    [defaultSelection, block, saveSlateBlockSelection],
  );

  // Get editing instructions from block settings or props
  let instructions = data?.instructions?.data || data?.instructions;
  if (!instructions || instructions === '<p><br/></p>') {
    instructions = formDescription;
  }

  if (block === 'fc0e3cec-19bc-4b20-be39-0d3550232759') {
    if (value?.[0]?.children?.[0]?.type === 'ol') {
      console.log('RENDERING TBE #2 w/ value', value);
    }
  }

  const placeholder = data.placeholder || formTitle || 'Enter some rich text…';
  return (
    <>
      <SidebarPortal selected={selected}>
        <div id="slate-plugin-sidebar"></div>
        {instructions ? (
          <Segment secondary attached>
            <div dangerouslySetInnerHTML={{ __html: instructions }} />
          </Segment>
        ) : (
          <>
            <ShortcutListing />
            <MarkdownIntroduction />
          </>
        )}
      </SidebarPortal>

      {DEBUG ? <div>{block}</div> : ''}
      <Dropzone
        disableClick
        onDrop={onDrop}
        className="dropzone"
        onDragOver={() => setShowDropzone(true)}
        onDragLeave={() => setShowDropzone(false)}
      >
        {showDropzone ? (
          <div className="drop-indicator">
            {uploading ? (
              <Dimmer active>
                <Loader indeterminate>Uploading image</Loader>
              </Dimmer>
            ) : (
              <Message>
                <center>
                  <img src={imageBlockSVG} alt="" />
                </center>
              </Message>
            )}
          </div>
        ) : (
          <SlateEditor
            index={index}
            properties={properties}
            extensions={textblockExtensions}
            renderExtensions={[withBlockProperties]}
            value={value}
            block={block}
            onFocus={() => onSelectBlock(block)}
            onUpdate={handleUpdate}
            debug={DEBUG}
            onChange={(value, selection) => {
              console.log('LATEST VALUE IN TBE.jsx', value);
              onChangeBlock(block, {
                ...data,
                value,
                plaintext: serializeNodesToText(value || []),
                // TODO: also add html serialized value
              });
            }}
            onClick={(ev) => {
              // this is needed so that the click event does
              // not bubble up to the Blocks/Block/Edit.jsx component
              // which attempts to focus the TextBlockEdit on
              // click and this behavior breaks user selection, e.g.
              // when clicking once a selected word
              ev.stopPropagation();
            }}
            onKeyDown={handleKey}
            selected={selected}
            placeholder={placeholder}
          />
        )}
      </Dropzone>
      {!detached && !data.plaintext && !data.disableNewBlocks && (
        <Button
          basic
          icon
          onClick={() => {
            // This event handler unregisters itself after its first call.
            document.addEventListener('mousedown', handleClickOutside, false);

            setAddNewBlockOpened(!addNewBlockOpened);
          }}
          className="block-add-button"
        >
          <Icon name={addSVG} className="block-add-button" size="24px" />
        </Button>
      )}
      {addNewBlockOpened && (
        <BlockChooser
          onMutateBlock={(...args) => {
            onMutateBlock(...args);
            setAddNewBlockOpened(false);
          }}
          currentBlock={block}
          allowedBlocks={allowedBlocks}
        />
      )}
    </>
  );
};

export default connect(
  (state, props) => {
    const blockId = props.block;
    return {
      defaultSelection: blockId
        ? state.slate_block_selections?.[blockId]
        : null,
      createRequest: state.content?.subrequests?.[props.block] || {},
      createdContent: state.content?.subrequests?.[props.block]?.data || {},
    };
  },
  {
    createContent,
    saveSlateBlockSelection, // needed as editor blockProps
  },
)(TextBlockEdit);
