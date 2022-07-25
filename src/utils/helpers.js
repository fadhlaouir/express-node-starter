/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Dependencies
const _ = require('lodash');
var admin = require('firebase-admin');

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */
/**
 * This function converts an Array of object into new Array of object except unwanted keys
 * example: we have an Array contain objects like obj:{ a:1, b:{x:'xx',d:'dd'}, c:2}
 * and we want to return values of object `b` without the key
 * the result is Array :[{ a:1, x:'xx', d:'dd', c:2},...]
 * @param {Array} array
 * @param {String} lang
 * @returns Array of object
 */
function getfilteredArrayOfObject(array, lang) {
  let newArray = [];
  array.map((obj) => newArray.push({ ...obj, ...obj[`${lang}`] }));
  let output = newArray.map((arr) => _.omit(arr, lang));
  return output;
}

/**
 * This function converts an object of object into new object except unwanted keys
 * example: we have an Object contain objects like obj:{ a:1, b:{x:'xx',d:'dd'}, c:2}
 * and we want to return values of object `b` without the key
 * the result is obj :{ a:1, x:'xx', d:'dd', c:2}
 * @param {Array} object
 * @param {String} lang
 * @returns Array of object
 */
function getfilteredObjectOfObject(object, lang) {
  let newArray = [];
  newArray.push({ ...object, ...object[`${lang}`] });
  let output = newArray.map((arr) => _.omit(arr, lang));
  return output[0];
}

/**
 * Fire base admin configuration to send notification for mobile users
 */
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
  client_x509_cert_url: process.env.CLIENT_CERT_URL,
};

/**
 * Initialize firebase app
 */
const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// export module
module.exports = {
  getfilteredArrayOfObject,
  getfilteredObjectOfObject,
  serviceAccount,
  firebaseAdmin,
};
