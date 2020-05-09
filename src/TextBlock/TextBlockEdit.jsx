import isHotkey from 'is-hotkey';
import React, { useMemo, useCallback, useState } from 'react';
import { createEditor, Transforms, Editor } from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import { withHistory } from 'slate-history';
import cx from 'classnames';
import { Element, Leaf, serialize } from './base';

import boldIcon from '@plone/volto/icons/bold.svg';
import codeIcon from '@plone/volto/icons/code.svg';
import headingIcon from '@plone/volto/icons/heading.svg';
import italicIcon from '@plone/volto/icons/italic.svg';
import listBulletIcon from '@plone/volto/icons/list-bullet.svg';
import listNumberedIcon from '@plone/volto/icons/list-numbered.svg';
import quoteIcon from '@plone/volto/icons/quote.svg';
import subheadingIcon from '@plone/volto/icons/subheading.svg';
import toggleIcon from '@plone/volto/icons/freedom.svg';
import underlineIcon from '@plone/volto/icons/underline.svg';

import { Icon } from '@plone/volto/components';
// import { Button as UIButton } from 'semantic-ui-react';

import './less/editor.less';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  'mod+&': 'placeholder',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const Button = React.forwardRef(
  ({ className, active, reversed, icon, style, ...props }, ref) => {
    style = {
      ...style,
      cursor: 'pointer',
      color: reversed
        ? active
          ? 'white'
          : '#888'
        : active
        ? ' black'
        : '#888',
    };

    return (
      <span {...props} ref={ref} style={style} className={cx(className)}>
        <Icon name={icon} size="24px" />
      </span>
    );
  },
);

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      icon={icon}
    />
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      icon={icon}
    />
  );
};

export const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <div {...props} ref={ref} className={cx(className, 'slate-menu')} />
));

export const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
  <Menu {...props} ref={ref} className={cx(className, 'slate-toolbar')} />
));

const SlateToolbar = props => (
  <Toolbar>
    <MarkButton format="bold" icon={boldIcon} />
    <MarkButton format="italic" icon={italicIcon} />
    <MarkButton format="underline" icon={underlineIcon} />
    <MarkButton format="code" icon={codeIcon} />

    <BlockButton format="heading-one" icon={headingIcon} />
    <BlockButton format="heading-two" icon={subheadingIcon} />
    <BlockButton format="block-quote" icon={quoteIcon} />

    <BlockButton format="numbered-list" icon={listNumberedIcon} />
    <BlockButton format="bulleted-list" icon={listBulletIcon} />
  </Toolbar>
);

const TextBlockEdit = ({ block, data, onChangeBlock, selected, ...props }) => {
  const { value } = data;
  const [showToolbar, setShowToolbar] = useState(false);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <div
      className={cx('slate-editor', { 'show-toolbar': showToolbar, selected })}
    >
      <Slate
        editor={editor}
        value={value || initialValue}
        onChange={value => {
          onChangeBlock(block, {
            ...data,
            value,
            plaintext: serialize(value || []),
          });
        }}
      >
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter some rich text…"
          spellCheck
          onKeyDown={event => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            }
          }}
        />
        <div className={cx('toolbar-wrapper', { active: showToolbar })}>
          {selected && (
            <>
              <Button
                onMouseDown={() => setShowToolbar(!showToolbar)}
                active={showToolbar}
                icon={toggleIcon}
                style={{ float: 'right' }}
              />
              {showToolbar ? <SlateToolbar /> : ''}
            </>
          )}
        </div>
      </Slate>
    </div>
  );
};
export default TextBlockEdit;
