import { Icon } from '@plone/volto/components';
import backSVG from '@plone/volto/icons/back.svg';
import rightArrowSVG from '@plone/volto/icons/right-key.svg';
import React, { useState } from 'react';
import { Button, Input, Loader } from 'semantic-ui-react';

const MasterDetailWidget = (props) => {
  const [hideCollection, setHideCollection] = useState(false);
  const [moveMenu, setMoveMenu] = useState(0);
  const [searchTerm, setSearchTerm] = useState(null);

  const pull = () => {
    setMoveMenu(0);
    setHideCollection(false);
    props.pull();
  };

  const onClick = () => {
    props.showCollections();
  };

  const pushCollection = (selectedCollection) => {
    setMoveMenu(-1);
    setHideCollection(true);
    props.pushCollection(selectedCollection);
  };

  const pushItem = (selectedItem) => {
    setHideCollection(true);
    props.pushItem(selectedItem);
  };

  const handleInput = (ev) => {
    ev.preventDefault();
    props.onChangeSearchTerm(searchTerm);
  };

  const onChange = (ev) => {
    ev.preventDefault();
    setSearchTerm(ev.target.value);
  };

  const collectionsList = () => {
    return !props.loading
      ? props.collections.map((collection, index) => (
          <li>
            <button
              onClick={(ev) => {
                ev.preventDefault();
                return pushCollection(index);
              }}
            >
              {collection.data.name}
              <Icon name={rightArrowSVG} size="24px" />
            </button>
          </li>
        ))
      : null;
  };

  const itemsList = !props.loading ? (
    props.items.length > 0 ? (
      props.items.map((item, index) => (
        <li>
          <button
            onClick={(ev) => {
              ev.preventDefault();
              return pushItem(index);
            }}
          >
            {item.data.title ? `${item.data.title.slice(0, 100)}...` : ''}
          </button>
        </li>
      ))
    ) : (
      <li>No results...</li>
    )
  ) : null;

  const searchResultsList = !props.loading ? (
    props.searchResults.length > 0 ? (
      props.searchResults.map((item, index) => (
        <li>
          <button
            onClick={(ev) => {
              ev.preventDefault();
              return props.pushSearchItem(index);
            }}
          >
            {item.data.title ? `${item.data.title.slice(0, 100)}...` : ''}
          </button>
        </li>
      ))
    ) : (
      <li>No results...</li>
    )
  ) : null;

  const collectionsClass = hideCollection
    ? 'collections pastanaga-menu transition-hide'
    : 'collections pastanaga-menu transition-show';

  const loaderComp = (
    <div className="loader-relative">
      <Loader active size="small">
        Loading
      </Loader>
    </div>
  );

  return (
    <div id="master-detail">
      <div
        className="pusher-puller"
        // ref={(node) => (pusher = node)}
        style={{
          transform: `translateX(${moveMenu * 375}px)`,
        }}
      >
        <div className={collectionsClass}>
          <header className="header pulled">
            <Button onClick={onClick} primary={!!props.showResults}>
              Show Library
            </Button>
            <Input
              action={{
                icon: 'search',
                onClick: handleInput,
              }}
              placeholder="Search..."
              onChange={onChange}
            />

            <div className="vertical divider" />
          </header>
          <div className="pastanaga-menu-list">
            {props.loading ? (
              loaderComp
            ) : (
              <>
                <ul>
                  {props.showResults ? searchResultsList : collectionsList()}
                </ul>
              </>
            )}
          </div>
        </div>

        <div className={'items pastanaga-menu'}>
          <header className="header pulled">
            <button onClick={pull}>
              <Icon name={backSVG} size="30px" />
            </button>
            <div className="vertical divider" />
            <h2>{props.collections[props.selectedCollection]?.data?.name}</h2>
          </header>
          <div className="pastanaga-menu-list">
            {props.loading ? loaderComp : <ul>{itemsList}</ul>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterDetailWidget;
