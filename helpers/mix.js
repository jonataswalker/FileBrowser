
export function sortAlphabetically(array) {
  return array.sort((a, b) => a.localCompare(b));
}

/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
export function guid() {
  const _p8 = (s) => {
    const p = (Math.random().toString(16) + '000000000').substr(2, 8);
    return s ? `-${p.substr(0, 4)}-${p.substr(4, 4)}` : p;
  };
  return _p8() + _p8(true) + _p8(true) + _p8();
}

export function ID() {
  return Math.random().toString(36).substr(2, 9);
}

export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    if (typeof Error !== 'undefined') {
      throw new Error(message);
    }
    throw message; // Fallback
  }
}
