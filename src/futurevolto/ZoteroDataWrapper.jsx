import { Icon as VoltoIcon } from '@plone/volto/components';
import briefcaseSVG from '@plone/volto/icons/briefcase.svg';
import checkSVG from '@plone/volto/icons/check.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import formatClearSVG from '@plone/volto/icons/format-clear.svg';
import React, { useEffect, useState } from 'react';
import { Button, Dropdown } from 'semantic-ui-react';
import InlineForm from 'volto-slate/futurevolto/InlineForm';
import MasterDetailWidget from 'volto-slate/futurevolto/MasterDetailWidget';

const zoteroEEAFormatFileUrl =
  'https://raw.githubusercontent.com/rexalex/rex-Spoon-Knife/master/EEA%20style%20for%20Zotero.csl.xml';
const zoteroStyles = [
  { key: 'eea', value: zoteroEEAFormatFileUrl, text: 'EAA' },
  { key: 'af', value: 'academic-medicine', text: 'Academic Medicine' },
  { key: 'ax', value: 'academic-pediatrics', text: 'Academic Pediatrics' },
  { key: 'al', value: 'academic-psychiatry', text: 'Academic Psychiatry' },
  {
    key: 'dz',
    value: 'academy-of-management-discoveries',
    text: 'Academic of Management Discoveries',
  },
  { key: 'as', value: 'accounting-forum', text: 'Academic Forum' },
  {
    key: 'ad',
    value: 'accounting-history-review',
    text: 'Academic History Review',
  },
];

const url = 'https://api.zotero.org/groups/122386/collections/';
// const url = 'https://api.zotero.org/users/6732551/items/top?v=3'; //rexalex
const bearer_token = 'R5OtzVo8teKAV4TaZUOqUu1N';
// const bearer_token = 'IjkrM27dVuTikWqk6Wlizybk'; //rexalex
const bearer = 'Bearer ' + bearer_token;
const headers = {
  Authorization: bearer,
  'Content-Type': 'application/json',
};
const zoteroBaseUrl = 'https://api.zotero.org/groups/122386/';
const urlSearch = 'https://api.zotero.org/groups/122386/items?q=';

const allRequests = {};
const cacheAllRequests = (url, items) => {
  allRequests[url] = items;
};

const ZoteroDataWrapper = (props) => {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [footnote, setFootnoteRef] = useState(props.formData?.footnote);
  const [footnoteTitle, setfootnoteTitle] = useState(
    props.formData?.footnoteTitle,
  );
  const [itemIdRef, setItemIdRef] = useState(props.formData?.itemId);
  const [showResults, setShowResults] = useState(false);
  const [collections, setCollections] = useState([]);
  const [items, setItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState(zoteroEEAFormatFileUrl);
  const [searchTerm, setSearchTerm] = useState(null);
  // const [allZoteroStyles, setAllZoteroStyles] = useState([]);
  const [allZoteroStyles, setAllZoteroStyles] = useState(zoteroStyles);

  const fetchAllZoteroStyles = (collectionId) => {
    const finalUrl = `https://www.zotero.org/styles-files/styles.json`;
    setLoading(true);

    fetch(finalUrl, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((results) => {
        const formattedStyles = results.map((style) => ({
          key: style.name,
          value: style.name,
          text: style.title,
        }));
        setAllZoteroStyles([
          ...[{ key: 'eea', value: zoteroEEAFormatFileUrl, text: 'EAA' }],
          ...formattedStyles,
        ]);
        setLoading(false);
      })
      .catch((error) => {
        console.log('@@@@ error', error);
        setLoading(false);
      });
  };
  const fetchCollections = (collectionId, offset = 0) => {
    const tempUrl = collectionId ? `${url}${collectionId}/items/` : `${url}`;
    const finalUrl = `${tempUrl}?v=3&start=${offset}`;

    if (allRequests[finalUrl]) {
      if (collectionId) {
        setItems(allRequests[finalUrl]);
      } else {
        setCollections(allRequests[finalUrl]);
      }
    } else {
      setLoading(true);

      fetch(finalUrl, {
        method: 'GET',
        headers,
      })
        .then((response) => response.json())
        .then((results) => {
          let finalResult = [];
          if (collectionId) {
            finalResult = offset > 0 ? [...items, ...results] : results;
            setItems(finalResult);
          } else {
            finalResult = offset > 0 ? [...collections, ...results] : results;
            setCollections(finalResult);
          }
          cacheAllRequests(finalUrl, finalResult);
          setLoading(false);
        })
        .catch((error) => {
          console.log('@@@@ error', error);
          setLoading(false);
        });
    }
  };

  const fetchSearch = (term, offset = 0) => {
    const finalUrl = `${urlSearch}${term}&start=${offset}`;
    setSearchTerm(term);
    if (allRequests[finalUrl]) {
      setShowResults(true);
      setSearchResults(allRequests[finalUrl]);
    } else {
      setLoading(true);
      setShowResults(true);

      fetch(finalUrl, {
        method: 'GET',
        headers,
      })
        .then((response) => response.json())
        .then((results) => {
          const finalResult =
            offset > 0 ? [...searchResults, ...results] : results;
          setSearchResults(finalResult);
          cacheAllRequests(finalUrl, finalResult);
          setLoading(false);
        })
        .catch((error) => {
          console.log('@@@@ error', error);
          setLoading(false);
        });
    }
  };

  const fetchItem = (itemId) => {
    const testUrl = `${zoteroBaseUrl}/items/${itemId}?format=bib&style=${style}`;
    if (allRequests[testUrl]) {
      setFootnoteRef(allRequests[testUrl]);
    } else {
      setLoading(true);

      fetch(testUrl, {
        method: 'GET',
        headers,
      })
        .then((response) => response.text())
        .then((results) => {
          setFootnoteRef(results);
          cacheAllRequests(testUrl, results);
          setLoading(false);
        })
        .catch((error) => {
          console.log('@@@@ error', error);
          setLoading(false);
        });
    }
  };

  const handleLoadMore = (ev) => {
    if (showResults) {
      fetchSearch(searchTerm, searchResults.length);
    } else if (selectedCollection === null) {
      fetchCollections(null, collections.length);
    } else {
      fetchCollections(collections[selectedCollection].key, items.length);
    }
  };

  const onChangeSearchTerm = (value) => {
    fetchSearch(value);
  };
  const onChangeStyle = (value) => {
    setStyle(value);
  };

  const pull = () => {
    setSelectedCollection(null);
  };

  const pushCollection = (selectedCollection) => {
    fetchCollections(collections[selectedCollection].key);
    setSelectedCollection(selectedCollection);
  };

  const showCollections = () => {
    setShowResults(false);
  };

  const pushItem = (selectedItem) => {
    fetchItem(items[selectedItem].key);
    setfootnoteTitle(items[selectedItem].data.title);
    setItemIdRef(items[selectedItem].key);
  };

  const pushSearchItem = (selectedItem) => {
    fetchItem(searchResults[selectedItem].key);
    setfootnoteTitle(searchResults[selectedItem].data.title);
    setItemIdRef(items[selectedItem].key);
  };

  // Similar to componentDidMount and componentDidUpdate:
  // used only once at mount
  useEffect(() => {
    console.log('eff');
    fetchCollections();
    // fetchAllZoteroStyles();
  }, []); // to be used only once at mount

  const newFormData = {
    ...props.formData,
    ...{ footnoteTitle },
  };
  const formData = {
    ...props.formData,
    ...{ footnote, itemId: itemIdRef, footnoteTitle },
  };
  return (
    <div id="zotero-comp">
      <InlineForm
        schema={props.schema}
        title={props.title}
        icon={<VoltoIcon size="24px" name={briefcaseSVG} />}
        onChangeField={(id, value) => {
          props.onChangeField(formData);
        }}
        formData={newFormData}
        headerActions={
          <>
            <button
              onClick={(id, value) => {
                props.submitHandler(formData);
              }}
            >
              <VoltoIcon size="24px" name={checkSVG} />
            </button>
            <button onClick={props.clearHandler}>
              <VoltoIcon size="24px" name={formatClearSVG} />
            </button>
            <button onClick={props.hideHandler}>
              <VoltoIcon size="24px" name={clearSVG} />
            </button>
          </>
        }
      />
      <Dropdown
        placeholder="Select style"
        fluid
        search
        selection
        options={allZoteroStyles}
        onChange={(ev, data) => {
          onChangeStyle(data.value);
        }}
      />
      <MasterDetailWidget
        pull={pull}
        pushCollection={pushCollection}
        pushItem={pushItem}
        items={items}
        collections={collections}
        loading={loading}
        selectedCollection={selectedCollection}
        onChangeSearchTerm={onChangeSearchTerm}
        showResults={showResults}
        searchResults={searchResults}
        pushSearchItem={pushSearchItem}
        showCollections={showCollections}
        handleLoadMore={handleLoadMore}
      ></MasterDetailWidget>
      <Button primary onClick={handleLoadMore}>
        Load more
      </Button>
    </div>
  );
};

export default ZoteroDataWrapper;
