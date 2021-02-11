/* eslint no-console: ["error", { allow: ["log"] }] */

Cypress.Commands.add(
  'justVisible',
  { prevSubject: 'element' },
  (subject, options) => {
    // let arr = [];
    for (let el of subject) {
      if (Cypress.dom.isVisible(el)) {
        return el;
        // arr.push(el);
      }
    }
    // return arr;
  },
);

/**
 * Checks if the subject (expected to be a slate editor element) contains focus or is focused itself.
 */
Cypress.Commands.add(
  'slateEditorShouldBeFocused',
  { prevSubject: 'element' },
  (subject, options) => {
    // the last Slate block should be focused
    return cy
      .wrap(subject)
      .then((editorElement) => {
        return cy.focused().then((focusedEl) => {
          return Cypress.$.contains(editorElement[0], focusedEl[0]);
        });
      })
      .should('eq', true);
  },
);

/**
 * Slate commands taken from this page because of that issue:
 * https://github.com/ianstormtaylor/slate/issues/3476
 */

Cypress.Commands.add('getEditor', (selector) => {
  return cy.get(selector).click();
});

Cypress.Commands.add(
  'typeInSlate',
  { prevSubject: 'element' },
  (subject, text) => {
    return (
      cy
        .wrap(subject)
        .then((subject) => {
          subject[0].dispatchEvent(
            new InputEvent('beforeinput', {
              inputType: 'insertText',
              data: text,
            }),
          );
          return subject;
        })
        // TODO: do this only for Electron-based browser which does not understand instantaneously
        // that the user inserted some text in the block
        .wait(1000)
    );
  },
);

Cypress.Commands.add('clearInSlate', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).then((subject) => {
    subject[0].dispatchEvent(
      new InputEvent('beforeinput', { inputType: 'deleteHardLineBackward' }),
    );
    return subject;
  });
});

Cypress.Commands.add(
  'selectAllAndOpenHoveringToolbar',
  { prevSubject: true },
  (subject) => {
    // select all contents of slate block and open hovering toolbar
    return cy.wrap(subject).find('span:first').type('{selectall}').dblclick();
  },
);

// TODO: make this command chainable (so that it passes the `subject` to the next chained command)
Cypress.Commands.add('lineBreakInSlate', { prevSubject: true }, (subject) => {
  return (
    cy
      .wrap(subject)
      .then((subject) => {
        subject[0].dispatchEvent(
          new InputEvent('beforeinput', { inputType: 'insertLineBreak' }),
        );
        return subject;
      })
      // TODO: do this only for Electron-based browser which does not understand instantaneously
      // that the block was split
      .wait(1000)
  );
});

Cypress.Commands.add('clearAllInSlate', { prevSubject: true }, (subject) => {
  // TODO: do not hardcode this 10 here
  for (let i = 0; i < 10; ++i) {
    cy.wrap(subject).then((subject) => {
      subject[0].dispatchEvent(
        new InputEvent('beforeinput', { inputType: 'deleteHardLineBackward' }),
      );
      return subject;
    });
  }
});

// --- AUTOLOGIN -------------------------------------------------------------
Cypress.Commands.add('autologin', () => {
  let api_url, user, password;
  api_url = Cypress.env('API_PATH') || 'http://localhost:8080/Plone';
  user = 'admin';
  password = 'admin';

  return cy
    .request({
      method: 'POST',
      url: `${api_url}/@login`,
      headers: { Accept: 'application/json' },
      body: { login: user, password: password },
    })
    .then((response) => cy.setCookie('auth_token', response.body.token));
});

// --- CREATE CONTENT --------------------------------------------------------
Cypress.Commands.add(
  'createContent',
  ({
    contentType,
    contentId,
    contentTitle,
    path = '',
    allow_discussion = false,
  }) => {
    let api_url, auth;
    api_url = Cypress.env('API_PATH') || 'http://localhost:8080/Plone';
    auth = {
      user: 'admin',
      pass: 'admin',
    };
    if (contentType === 'File') {
      return cy.request({
        method: 'POST',
        url: `${api_url}/${path}`,
        headers: {
          Accept: 'application/json',
        },
        auth: auth,
        body: {
          '@type': contentType,
          id: contentId,
          title: contentTitle,
          file: {
            data: 'dGVzdGZpbGUK',
            encoding: 'base64',
            filename: 'lorem.txt',
            'content-type': 'text/plain',
          },
          allow_discussion: allow_discussion,
        },
      });
    }
    if (contentType === 'Image') {
      return cy.request({
        method: 'POST',
        url: `${api_url}/${path}`,
        headers: {
          Accept: 'application/json',
        },
        auth: auth,
        body: {
          '@type': contentType,
          id: contentId,
          title: contentTitle,
          image: {
            data:
              'iVBORw0KGgoAAAANSUhEUgAAANcAAAA4CAMAAABZsZ3QAAAAM1BMVEX29fK42OU+oMvn7u9drtIPisHI4OhstdWZyt4fkcXX5+sAg74umMhNp86p0eJ7vNiKw9v/UV4wAAAAAXRSTlMAQObYZgAABBxJREFUeF7tmuty4yAMhZG4X2zn/Z92J5tsBJwWXG/i3XR6frW2Y/SBLIRAfaQUDNt8E5tLUt9BycfcKfq3R6Mlfyimtx4rzp+K3dtibXkor99zsEqLYZltblTecciogoh+TXfY1Ve4dn07rCDGG9dHSEEOg/GmXl0U1XDxTKxNK5De7BxsyyBr6gGm2/vPxKJ8F6f7BXKfRMp1xIWK9A+5ks25alSb353dWnDJN1k35EL5f8dVGifTf/4tjUuuFq7u4srmXC60yAmldLXIWbg65RKU87lcGxJCFqUPv0IacW0PmSivOZFLE908inPToMmii/roG+MRV/O8FU88i8tFsxV3a06MFUw0Qu7RmAtdV5/HVVaOVMTWNOWSwMljLhzhcB6XIS7OK5V6AvRDNN7t5VJWQs1J40UmalbK56usBG/CuCHSYuc+rkUGeMCViNRARPrzW52N3oQLe6WifNliSuuGaH3czbVNudI9s7ZLUCLHVwWlyES522o1t14uvmbblmVTKqFjaZYJFSTPP4dLL1kU1z7p0lzdbRulmEWLxoQX+z9ce7A8GqEEucllLxePuZwdJl1Lezu0hoswvTPt61DrFcRuujV/2cmlxaGBC7Aw6cpovGANwRiSdOAWJ5AGy4gLL64dl0QhUEAuEUNws+XxV+OKGPdw/hESGYF9XEGaFC7sNLMSXWJjHsnanYi87VK428N2uxpOjOFANcagLM5l+7mSycM8KknZpKLcGi6jmzWGr/vLurZ/0g4u9AZuAoeb5r1ceQhyiTPY1E4wUR6u/F3H2ojSpXMMriBPT9cezTto8Cx+MsglHL4fv1Rxrb1LVw9yvyQpJ3AhFnLZfuRLH2QsOG3FGGD20X/th/u5bFAt16Bt308KjF+MNOXgl/SquIEySX3GhaZvc67KZbDxcCDORz2N8yCWPaY5lyQZO7lQ29fnZbt3Xu6qoge4+DjXl/MocySPOp9rlvdyznahRyHEYd77v3LhugOXDv4J65QXfl803BDAdaWBEDhfVx7nKofjoVCgxnUAqw/UAUDPn788BDvQuG4TDtdtUPvzjSlXAB8DvaDOhhrmhwbywylXAm8CvaouikJTL93gs3y7Yy4VYbIxOHrcMizPqWOjqO9l3Uz52kibQy4xxOgqhJvD+w5rvokOcAlGvNCfeqCv1ste1stzLm0f71Iq3ZfTrPfuE5nhPtF+LvQE2lffQC7pYtQy3tdzdrKvd5TLVVzDetScS3nEKmmwDyt1Cev1kX3YfbvzNK4fzrlw+cB6vm+uiUgf2zdXI62241LawCb7Pi5FXFPF8KpzDoF/Sw2lg+GrHNbno1mhPu+VCF/vfMnw06PnUl6j48dVHD3jHNHPua+fc3o/5yp/zsGi0vYtzi3Pz5mHd4T6BWMIlewacd63AAAAAElFTkSuQmCC',
            encoding: 'base64',
            filename: 'image.png',
            'content-type': 'image/png',
          },
        },
      });
    }
    if (['Document', 'Folder', 'CMSFolder'].includes(contentType)) {
      return cy
        .request({
          method: 'POST',
          url: `${api_url}/${path}`,
          headers: {
            Accept: 'application/json',
          },
          auth: auth,
          body: {
            '@type': contentType,
            id: contentId,
            title: contentTitle,
            blocks: {
              'd3f1c443-583f-4e8e-a682-3bf25752a300': { '@type': 'title' },
              '7624cf59-05d0-4055-8f55-5fd6597d84b0': { '@type': 'text' },
            },
            blocks_layout: {
              items: [
                'd3f1c443-583f-4e8e-a682-3bf25752a300',
                '7624cf59-05d0-4055-8f55-5fd6597d84b0',
              ],
            },
            allow_discussion: allow_discussion,
          },
        })
        .then(() => console.log(`${contentType} created`));
    } else {
      return cy
        .request({
          method: 'POST',
          url: `${api_url}/${path}`,
          headers: {
            Accept: 'application/json',
          },
          auth: auth,
          body: {
            '@type': contentType,
            id: contentId,
            title: contentTitle,
            allow_discussion: allow_discussion,
          },
        })
        .then(() => console.log(`${contentType} created`));
    }
  },
);

// --- REMOVE CONTENT --------------------------------------------------------
Cypress.Commands.add('removeContent', (path) => {
  let api_url, auth;
  api_url = Cypress.env('API_PATH') || 'http://localhost:8080/Plone';
  auth = {
    user: 'admin',
    pass: 'admin',
  };
  return cy
    .request({
      method: 'DELETE',
      url: `${api_url}/${path}`,
      headers: {
        Accept: 'application/json',
      },
      auth: auth,
      body: {},
    })
    .then(() => console.log(`${path} removed`));
});

// --- SET WORKFLOW ----------------------------------------------------------
Cypress.Commands.add(
  'setWorkflow',
  ({
    path = '/',
    actor = 'admin',
    review_state = 'publish',
    time = '1995-07-31T18:30:00',
    title = '',
    comment = '',
    effective = '2018-01-21T08:00:00',
    expires = '2019-01-21T08:00:00',
    include_children = true,
  }) => {
    let api_url, auth;
    api_url = Cypress.env('API_PATH') || 'http://localhost:8080/Plone';
    auth = {
      user: 'admin',
      pass: 'admin',
    };
    return cy.request({
      method: 'POST',
      url: `${api_url}/${path}/@workflow/${review_state}`,
      headers: {
        Accept: 'application/json',
      },
      auth: auth,
      body: {
        actor: actor,
        review_state: review_state,
        time: time,
        title: title,
        comment: comment,
        effective: effective,
        expires: expires,
        include_children: include_children,
      },
    });
  },
);

// --- waitForResourceToLoad ----------------------------------------------------------
Cypress.Commands.add('waitForResourceToLoad', (fileName, type) => {
  const resourceCheckInterval = 40;

  return new Cypress.Promise((resolve) => {
    const checkIfResourceHasBeenLoaded = () => {
      const resource = cy
        .state('window')
        .performance.getEntriesByType('resource')
        .filter((entry) => !type || entry.initiatorType === type)
        .find((entry) => entry.name.includes(fileName));

      if (resource) {
        resolve();

        return;
      }

      setTimeout(checkIfResourceHasBeenLoaded, resourceCheckInterval);
    };

    checkIfResourceHasBeenLoaded();
  });
});

// Low level command reused by `setSelection` and low level command `setCursor`
Cypress.Commands.add('selection', { prevSubject: true }, (subject, fn) => {
  cy.wrap(subject).trigger('mousedown').then(fn).trigger('mouseup');

  cy.document().trigger('selectionchange');
  return cy.wrap(subject);
});

Cypress.Commands.add(
  'setSelection',
  { prevSubject: true },
  (subject, query, endQuery) => {
    return cy.wrap(subject).selection(($el) => {
      if (typeof query === 'string') {
        const anchorNode = getTextNode($el[0], query);
        const focusNode = endQuery ? getTextNode($el[0], endQuery) : anchorNode;
        const anchorOffset = anchorNode.wholeText.indexOf(query);
        const focusOffset = endQuery
          ? focusNode.wholeText.indexOf(endQuery) + endQuery.length
          : anchorOffset + query.length;
        setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
      } else if (typeof query === 'object') {
        const el = $el[0];
        const anchorNode = getTextNode(el.querySelector(query.anchorQuery));
        const anchorOffset = query.anchorOffset || 0;
        const focusNode = query.focusQuery
          ? getTextNode(el.querySelector(query.focusQuery))
          : anchorNode;
        const focusOffset = query.focusOffset || 0;
        setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
      }
    });
  },
);

// Low level command reused by `setCursorBefore` and `setCursorAfter`, equal to `setCursorAfter`
Cypress.Commands.add(
  'setCursor',
  { prevSubject: true },
  (subject, query, atStart) => {
    return cy.wrap(subject).selection(($el) => {
      const node = getTextNode($el[0], query);
      const offset =
        node.wholeText.indexOf(query) + (atStart ? 0 : query.length);
      const document = node.ownerDocument;
      document.getSelection().removeAllRanges();
      document.getSelection().collapse(node, offset);
    });
    // Depending on what you're testing, you may need to chain a `.click()` here to ensure
    // further commands are picked up by whatever you're testing (this was required for Slate, for example).
  },
);

Cypress.Commands.add(
  'setCursorBefore',
  { prevSubject: true },
  (subject, query) => {
    cy.wrap(subject).setCursor(query, true);
  },
);

Cypress.Commands.add(
  'setCursorAfter',
  { prevSubject: true },
  (subject, query) => {
    cy.wrap(subject).setCursor(query);
  },
);

// Helper functions
function getTextNode(el, match) {
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  if (!match) {
    return walk.nextNode();
  }

  let node;
  while ((node = walk.nextNode())) {
    if (node.wholeText.includes(match)) {
      return node;
    }
  }
}

function setBaseAndExtent(...args) {
  const document = args[0].ownerDocument;
  document.getSelection().removeAllRanges();
  document.getSelection().setBaseAndExtent(...args);
}

Cypress.Commands.add('navigate', (route = '') => {
  return cy.window().its('appHistory').invoke('push', route);
});

Cypress.Commands.add('store', () => {
  return cy.window().its('store').invoke('getStore', '');
});

Cypress.Commands.add('settings', (key, value) => {
  return cy.window().its('settings');
});
