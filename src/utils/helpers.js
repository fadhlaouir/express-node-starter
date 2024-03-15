/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
// Dependencies
const _ = require('lodash');

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

// export module
module.exports = {
  getfilteredArrayOfObject,
  getfilteredObjectOfObject,
};
