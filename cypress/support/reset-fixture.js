const xmlrpc = require('xmlrpc');

// const args = process.argv;
const command = process.argv[2];

// create a client
const client = xmlrpc.createClient({
  host: process.env.CYPRESS_BACKEND_HOST || 'localhost',
  port: process.env.CYPRESS_BACKEND_PORT || 55001,
  path: '/plone/RobotRemote',
});

function setup() {
  // for / path
  // Setup site
  // client.methodCall(
  //   'zodb_setup',
  //   [],
  //   () => {},
  // );
  client.methodCall(
    'run_keyword',
    [
      'remote_zodb_setup',
      ['plone.app.robotframework.testing.PLONE_ROBOT_TESTING'],
    ],
    () => {},
  );
}

function teardown() {
  // for / path
  // client.methodCall(
  //   'zodb_teardown',
  //   [],
  //   (error, value) => {
  //     console.log('err + val', { error, value });
  //   },
  // );
  // Tearing down
  //
  client.methodCall(
    'run_keyword',
    [
      'remote_zodb_teardown',
      ['plone.app.robotframework.testing.PLONE_ROBOT_TESTING'],
    ],
    (error, value) => {
      console.log('err + val', { error, value });
    },
  );
}

switch (command) {
  case 'setup':
    return setup();
  case 'teardown':
    return teardown();
  default:
    return setup();
}
