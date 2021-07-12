import React from 'react';
import { connect } from 'react-redux';
import { readAsDataURL } from 'promise-file-reader';
import Dropzone from 'react-dropzone';

import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
import { Button, Dimmer, Loader, Message, Segment } from 'semantic-ui-react';

import { Icon, BlockChooser, SidebarPortal } from '@plone/volto/components';
import InlineForm from '@plone/volto/components/manage/Form/InlineForm';
import { flattenToAppURL, getBaseUrl } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

import { saveSlateBlockSelection } from 'volto-slate/actions';
import { SlateEditor } from 'volto-slate/editor';
import { serializeNodesToText } from 'volto-slate/editor/render';
import { createImageBlock, parseDefaultSelection } from 'volto-slate/utils';
import { uploadContent } from 'volto-slate/actions';
import { useIsomorphicLayoutEffect } from 'volto-slate/hooks';
import { Transforms } from 'slate';

import ShortcutListing from './ShortcutListing';
import MarkdownIntroduction from './MarkdownIntroduction';
import { handleKey, handleKeyDetached } from './keyboard';
import TextBlockSchema from './schema';

import imageBlockSVG from '@plone/volto/components/manage/Blocks/Image/block-image.svg';
import addSVG from '@plone/volto/icons/circle-plus.svg';

import { defineMessages, useIntl } from 'react-intl';

import { useInView } from 'react-intersection-observer';
// import VisibilitySensor from 'react-visibility-sensor';

import './css/editor.css';

// TODO: refactor dropzone to separate component wrapper

const messages = defineMessages({
  text: {
    id: 'Type text…',
    defaultMessage: 'Type text…',
  },
});

const DEBUG = false;

export const DefaultTextBlockEditor = (props) => {
  const {
    block,
    blocksConfig,
    data,
    detached = false,
    index,
    onChangeBlock,
    onInsertBlock,
    onMutateBlock,
    onSelectBlock,
    pathname,
    properties,
    selected,
    uploadRequest,
    uploadContent,
    uploadedContent,
    defaultSelection,
    saveSlateBlockSelection,
    allowedBlocks,
    formTitle,
    formDescription,
  } = props;

  const { slate } = config.settings;
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
          uploadContent(
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
    [pathname, uploadContent, block],
  );

  const { loaded, loading } = uploadRequest;
  const imageId = uploadedContent['@id'];
  const prevLoaded = prevReq.current;

  useIsomorphicLayoutEffect(() => {
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
        if (selection) {
          setTimeout(() => {
            Transforms.select(editor, selection);
            saveSlateBlockSelection(block, null);
          }, 120);
          // TODO: use React sync render API
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

  const intl = useIntl();
  const placeholder =
    data.placeholder || formTitle || intl.formatMessage(messages.text);
  const schema = TextBlockSchema(data);

  const disableNewBlocks = data?.disableNewBlocks || detached;
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '0px 0px 200px 0px',
  });

  return (
    <div className="text-slate-editor-inner" ref={ref}>
      <>
        {DEBUG ? <div>{block}</div> : ''}
        <Dropzone
          disableClick
          onDrop={onDrop}
          className="dropzone"
          onDragOver={() => setShowDropzone(true)}
          onDragLeave={() => setShowDropzone(false)}
        >
          {({ getRootProps, getInputProps }) => {
            return showDropzone ? (
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
                readOnly={!inView}
                properties={properties}
                extensions={textblockExtensions}
                renderExtensions={[withBlockProperties]}
                value={value}
                block={block /* is this needed? */}
                onFocus={() => onSelectBlock(block)}
                onUpdate={handleUpdate}
                debug={DEBUG}
                onChange={(value, selection) => {
                  onChangeBlock(block, {
                    ...data,
                    value,
                    plaintext: serializeNodesToText(value || []),
                    // TODO: also add html serialized value
                  });
                }}
                onKeyDown={handleKey}
                selected={selected}
                placeholder={placeholder}
              />
            );
          }}
        </Dropzone>
        {selected && !disableNewBlocks && !data.plaintext && (
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
            blocksConfig={blocksConfig}
            onInsertBlock={(id, value) => {
              onSelectBlock(onInsertBlock(id, value));
              setAddNewBlockOpened(false);
            }}
            currentBlock={block}
            allowedBlocks={allowedBlocks}
          />
        )}
        <SidebarPortal selected={selected}>
          <div id="slate-plugin-sidebar"></div>
          {instructions ? (
            <Segment attached>
              <div dangerouslySetInnerHTML={{ __html: instructions }} />
            </Segment>
          ) : (
            <>
              <ShortcutListing />
              <MarkdownIntroduction />
              <InlineForm
                schema={schema}
                title={schema.title}
                onChangeField={(id, value) => {
                  onChangeBlock(block, {
                    ...data,
                    [id]: value,
                  });
                }}
                formData={data}
              />
            </>
          )}
        </SidebarPortal>
      </>
    </div>
  );
};

export const DetachedTextBlockEditor = (props) => {
  const {
    data,
    index,
    properties,
    onSelectBlock,
    onChangeBlock,
    block,
    selected,
    formTitle,
    formDescription,
  } = props;
  const { value } = data;

  const schema = TextBlockSchema(data);
  const intl = useIntl();
  const placeholder =
    data.placeholder || formTitle || intl.formatMessage(messages.text);
  let instructions = data?.instructions?.data || data?.instructions;
  if (!instructions || instructions === '<p><br/></p>') {
    instructions = formDescription;
  }

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '0px 0px 200px 0px',
  });

  return (
    <div className="text-slate-editor-inner detached-slate-editor" ref={ref}>
      <SlateEditor
        index={index}
        readOnly={!inView}
        properties={properties}
        renderExtensions={[]}
        value={value}
        block={block /* is this needed? */}
        onFocus={() => onSelectBlock(block)}
        debug={DEBUG}
        onChange={(value, selection) => {
          onChangeBlock(block, {
            ...data,
            value,
            plaintext: serializeNodesToText(value || []),
            // TODO: also add html serialized value
          });
        }}
        selected={selected}
        placeholder={placeholder}
        onKeyDown={handleKeyDetached}
      />
      <SidebarPortal selected={selected}>
        <div id="slate-plugin-sidebar"></div>
        {instructions ? (
          <Segment attached>
            <div dangerouslySetInnerHTML={{ __html: instructions }} />
          </Segment>
        ) : (
          <>
            <ShortcutListing />
            <MarkdownIntroduction />
            <InlineForm
              schema={schema}
              title={schema.title}
              onChangeField={(id, value) => {
                onChangeBlock(block, {
                  ...data,
                  [id]: value,
                });
              }}
              formData={data}
            />
          </>
        )}
      </SidebarPortal>
    </div>
  );
};

const TextBlockEdit = (props) => {
  return props.detached ? ( // || props.disableNewBlocks
    <DetachedTextBlockEditor {...props} />
  ) : (
    <DefaultTextBlockEditor {...props} />
  );
};

export default connect(
  (state, props) => {
    const blockId = props.block;
    return {
      defaultSelection: blockId
        ? state.slate_block_selections?.[blockId]
        : null,
      uploadRequest: state.upload_content?.[props.block]?.upload || {},
      uploadedContent: state.upload_content?.[props.block]?.data || {},
    };
  },
  {
    uploadContent,
    saveSlateBlockSelection, // needed as editor blockProps
  },
)(TextBlockEdit);
