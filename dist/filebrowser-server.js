/*!
 * FileBrowser - v1.3.0
 * A multi-purpose filebrowser.
 * https://github.com/jonataswalker/FileBrowser
 * Built: Thu Oct 05 2017 16:09:01 GMT-0300 (-03)
 */

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Hapi = _interopDefault(require('hapi'));
var Good = _interopDefault(require('good'));
var Inert = _interopDefault(require('inert'));
var BrowserSync = _interopDefault(require('browser-sync'));
var fs = _interopDefault(require('fs'));
var pathUtil = _interopDefault(require('path'));
var Boom = _interopDefault(require('boom'));
var util = _interopDefault(require('util'));
var stream = _interopDefault(require('stream'));
var crypto = _interopDefault(require('crypto'));

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var promisify = createCommonjsModule(function (module) {
'use strict';

module.exports = (fn) => {
  return function () {
    const length = arguments.length;
    const args = new Array(length);

    for (let i = 0; i < length; i += 1) {
      args[i] = arguments[i];
    }

    return new Promise((resolve, reject) => {
      args.push((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });

      fn.apply(null, args);
    });
  };
};
});

var fs_1 = createCommonjsModule(function (module) {
// Adater module exposing all `fs` methods with promises instead of callbacks.

'use strict';




const isCallbackMethod = (key) => {
  return [
    typeof fs[key] === 'function',
    !key.match(/Sync$/),
    !key.match(/^[A-Z]/),
    !key.match(/^create/),
    !key.match(/^(un)?watch/),
  ].every(Boolean);
};

const adaptMethod = (name) => {
  const original = fs[name];
  return promisify(original);
};

const adaptAllMethods = () => {
  const adapted = {};

  Object.keys(fs).forEach((key) => {
    if (isCallbackMethod(key)) {
      if (key === 'exists') {
        // fs.exists() does not follow standard
        // Node callback conventions, and has
        // no error object in the callback
        adapted.exists = () => {
          throw new Error('fs.exists() is deprecated');
        };
      } else {
        adapted[key] = adaptMethod(key);
      }
    } else {
      adapted[key] = fs[key];
    }
  });

  return adapted;
};

module.exports = adaptAllMethods();
});

var validate = createCommonjsModule(function (module) {
'use strict';

const prettyPrintTypes = (types) => {
  const addArticle = (str) => {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    if (vowels.indexOf(str[0]) !== -1) {
      return `an ${str}`;
    }
    return `a ${str}`;
  };

  return types.map(addArticle).join(' or ');
};

const isArrayOfNotation = (typeDefinition) => {
  return /array of /.test(typeDefinition);
};

const extractTypeFromArrayOfNotation = (typeDefinition) => {
  // The notation is e.g. 'array of string'
  return typeDefinition.split(' of ')[1];
};

const isValidTypeDefinition = (typeStr) => {
  if (isArrayOfNotation(typeStr)) {
    return isValidTypeDefinition(extractTypeFromArrayOfNotation(typeStr));
  }

  return [
    'string',
    'number',
    'boolean',
    'array',
    'object',
    'buffer',
    'null',
    'undefined',
    'function',
  ].some((validType) => {
    return validType === typeStr;
  });
};

const detectType = (value) => {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  if (Buffer.isBuffer(value)) {
    return 'buffer';
  }

  return typeof value;
};

const onlyUniqueValuesInArrayFilter = (value, index, self) => {
  return self.indexOf(value) === index;
};

const detectTypeDeep = (value) => {
  let type = detectType(value);
  let typesInArray;

  if (type === 'array') {
    typesInArray = value
      .map((element) => {
        return detectType(element);
      })
      .filter(onlyUniqueValuesInArrayFilter);
    type += ` of ${typesInArray.join(', ')}`;
  }

  return type;
};

const validateArray = (argumentValue, typeToCheck) => {
  const allowedTypeInArray = extractTypeFromArrayOfNotation(typeToCheck);

  if (detectType(argumentValue) !== 'array') {
    return false;
  }

  return argumentValue.every((element) => {
    return detectType(element) === allowedTypeInArray;
  });
};

const validateArgument = (methodName, argumentName, argumentValue, argumentMustBe) => {
  const isOneOfAllowedTypes = argumentMustBe.some((type) => {
    if (!isValidTypeDefinition(type)) {
      throw new Error(`Unknown type "${type}"`);
    }

    if (isArrayOfNotation(type)) {
      return validateArray(argumentValue, type);
    }

    return type === detectType(argumentValue);
  });

  if (!isOneOfAllowedTypes) {
    throw new Error(`Argument "${argumentName}" passed to ${methodName} must be ${prettyPrintTypes(argumentMustBe)}. Received ${detectTypeDeep(argumentValue)}`);
  }
};

const validateOptions = (methodName, optionsObjName, obj, allowedOptions) => {
  if (obj !== undefined) {
    validateArgument(methodName, optionsObjName, obj, ['object']);
    Object.keys(obj).forEach((key) => {
      const argName = `${optionsObjName}.${key}`;
      if (allowedOptions[key] !== undefined) {
        validateArgument(methodName, argName, obj[key], allowedOptions[key]);
      } else {
        throw new Error(`Unknown argument "${argName}" passed to ${methodName}`);
      }
    });
  }
};

module.exports = {
  argument: validateArgument,
  options: validateOptions,
};
});

var mode = createCommonjsModule(function (module, exports) {
// Logic for unix file mode operations.

'use strict';

// Converts mode to string 3 characters long.
exports.normalizeFileMode = (mode) => {
  let modeAsString;
  if (typeof mode === 'number') {
    modeAsString = mode.toString(8);
  } else {
    modeAsString = mode;
  }
  return modeAsString.substring(modeAsString.length - 3);
};
});

var list = createCommonjsModule(function (module, exports) {
'use strict';




const validateInput = (methodName, path) => {
  const methodSignature = `${methodName}(path)`;
  validate.argument(methodSignature, 'path', path, ['string', 'undefined']);
};

// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------

const listSync = (path) => {
  try {
    return fs_1.readdirSync(path);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Doesn't exist. Return undefined instead of throwing.
      return undefined;
    }
    throw err;
  }
};

// ---------------------------------------------------------
// Async
// ---------------------------------------------------------

const listAsync = (path) => {
  return new Promise((resolve, reject) => {
    fs_1.readdir(path)
    .then((list) => {
      resolve(list);
    })
    .catch((err) => {
      if (err.code === 'ENOENT') {
        // Doesn't exist. Return undefined instead of throwing.
        resolve(undefined);
      } else {
        reject(err);
      }
    });
  });
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.validateInput = validateInput;
exports.sync = listSync;
exports.async = listAsync;
});

var remove = createCommonjsModule(function (module, exports) {
'use strict';






const validateInput = (methodName, path) => {
  const methodSignature = `${methodName}([path])`;
  validate.argument(methodSignature, 'path', path, ['string', 'undefined']);
};

// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------

const removeSync = (path) => {
  try {
    // Assume the path is a file and just try to remove it.
    fs_1.unlinkSync(path);
  } catch (err) {
    if (err.code === 'EPERM' || err.code === 'EISDIR' || err.code === 'ENOTEMPTY') {
      // Must delete everything inside the directory first.
      list.sync(path).forEach((filename) => {
        removeSync(pathUtil.join(path, filename));
      });
      // Everything inside directory has been removed,
      // it's safe now do go for the directory itself.
      fs_1.rmdirSync(path);
    } else if (err.code === 'ENOENT') {
      // File already doesn't exist. We're done.
    } else {
      // Something unexpected happened. Rethrow original error.
      throw err;
    }
  }
};

// ---------------------------------------------------------
// Async
// ---------------------------------------------------------

const removeAsyncInternal = (path, retryCount) => {
  return new Promise((resolve, reject) => {
    const retryInAWhileOrFail = (err) => {
      if (retryCount === 3) {
        // Too many retries already. Fail.
        reject(err);
      } else {
        // Try the same action after some pause.
        setTimeout(() => {
          removeAsyncInternal(path, retryCount + 1)
          .then(resolve, reject);
        }, 100);
      }
    };

    const removeEverythingInsideDirectory = () => {
      return list.async(path)
      .then((filenamesInsideDir) => {
        const promises = filenamesInsideDir.map((filename) => {
          return removeAsyncInternal(pathUtil.join(path, filename), 0);
        });
        return Promise.all(promises);
      });
    };

    // Assume the path is a file and just try to remove it.
    fs_1.unlink(path)
    .then(resolve)
    .catch((err) => {
      if (err.code === 'EBUSY') {
        retryInAWhileOrFail(err);
      } else if (err.code === 'EPERM' || err.code === 'EISDIR' || err.code === 'ENOTEMPTY') {
        // File deletion attempt failed. Probably it's not a file, it's a directory.
        // So try to proceed with that assumption.
        removeEverythingInsideDirectory()
        .then(() => {
          // Now go for the directory.
          return fs_1.rmdir(path);
        })
        .then(resolve)
        .catch((err2) => {
          if (err2.code === 'EBUSY' || err2.code === 'EPERM' || err2.code === 'ENOTEMPTY') {
            // Failed again. This might be due to other processes reading
            // something inside the directory. Let's take a nap and retry.
            retryInAWhileOrFail(err2);
          } else {
            reject(err2);
          }
        });
      } else if (err.code === 'ENOENT') {
        // File already doesn't exist. We're done.
        resolve();
      } else {
        // Something unexpected happened. Rethrow original error.
        reject(err);
      }
    });
  });
};

const removeAsync = (path) => {
  return removeAsyncInternal(path, 0);
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.validateInput = validateInput;
exports.sync = removeSync;
exports.async = removeAsync;
});

var dir = createCommonjsModule(function (module, exports) {
'use strict';







const validateInput = (methodName, path, criteria) => {
  const methodSignature = `${methodName}(path, [criteria])`;
  validate.argument(methodSignature, 'path', path, ['string']);
  validate.options(methodSignature, 'criteria', criteria, {
    empty: ['boolean'],
    mode: ['string', 'number'],
  });
};

const getCriteriaDefaults = (passedCriteria) => {
  const criteria = passedCriteria || {};
  if (typeof criteria.empty !== 'boolean') {
    criteria.empty = false;
  }
  if (criteria.mode !== undefined) {
    criteria.mode = mode.normalizeFileMode(criteria.mode);
  }
  return criteria;
};

const generatePathOccupiedByNotDirectoryError = (path) => {
  return new Error(`Path ${path} exists but is not a directory. Halting jetpack.dir() call for safety reasons.`);
};

// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------

const checkWhatAlreadyOccupiesPathSync = (path) => {
  let stat;

  try {
    stat = fs_1.statSync(path);
  } catch (err) {
    // Detection if path already exists
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  if (stat && !stat.isDirectory()) {
    throw generatePathOccupiedByNotDirectoryError(path);
  }

  return stat;
};

const createBrandNewDirectorySync = (path, opts) => {
  const options = opts || {};

  try {
    fs_1.mkdirSync(path, options.mode);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Parent directory doesn't exist. Need to create it first.
      createBrandNewDirectorySync(pathUtil.dirname(path), options);
      // Now retry creating this directory.
      fs_1.mkdirSync(path, options.mode);
    } else if (err.code === 'EEXIST') {
      // The path already exists. We're fine.
    } else {
      throw err;
    }
  }
};

const checkExistingDirectoryFulfillsCriteriaSync = (path, stat, criteria) => {
  const checkMode = () => {
    const mode$$1 = mode.normalizeFileMode(stat.mode);
    if (criteria.mode !== undefined && criteria.mode !== mode$$1) {
      fs_1.chmodSync(path, criteria.mode);
    }
  };

  const checkEmptiness = () => {
    if (criteria.empty) {
      // Delete everything inside this directory
      const list = fs_1.readdirSync(path);
      list.forEach((filename) => {
        remove.sync(pathUtil.resolve(path, filename));
      });
    }
  };

  checkMode();
  checkEmptiness();
};

const dirSync = (path, passedCriteria) => {
  const criteria = getCriteriaDefaults(passedCriteria);
  const stat = checkWhatAlreadyOccupiesPathSync(path);
  if (stat) {
    checkExistingDirectoryFulfillsCriteriaSync(path, stat, criteria);
  } else {
    createBrandNewDirectorySync(path, criteria);
  }
};

// ---------------------------------------------------------
// Async
// ---------------------------------------------------------

const checkWhatAlreadyOccupiesPathAsync = (path) => {
  return new Promise((resolve, reject) => {
    fs_1.stat(path)
    .then((stat) => {
      if (stat.isDirectory()) {
        resolve(stat);
      } else {
        reject(generatePathOccupiedByNotDirectoryError(path));
      }
    })
    .catch((err) => {
      if (err.code === 'ENOENT') {
        // Path doesn't exist
        resolve(undefined);
      } else {
        // This is other error that nonexistent path, so end here.
        reject(err);
      }
    });
  });
};

// Delete all files and directores inside given directory
const emptyAsync = (path) => {
  return new Promise((resolve, reject) => {
    fs_1.readdir(path)
    .then((list) => {
      const doOne = (index) => {
        if (index === list.length) {
          resolve();
        } else {
          const subPath = pathUtil.resolve(path, list[index]);
          remove.async(subPath).then(() => {
            doOne(index + 1);
          });
        }
      };

      doOne(0);
    })
    .catch(reject);
  });
};

const checkExistingDirectoryFulfillsCriteriaAsync = (path, stat, criteria) => {
  return new Promise((resolve, reject) => {
    const checkMode = () => {
      const mode$$1 = mode.normalizeFileMode(stat.mode);
      if (criteria.mode !== undefined && criteria.mode !== mode$$1) {
        return fs_1.chmod(path, criteria.mode);
      }
      return Promise.resolve();
    };

    const checkEmptiness = () => {
      if (criteria.empty) {
        return emptyAsync(path);
      }
      return Promise.resolve();
    };

    checkMode()
    .then(checkEmptiness)
    .then(resolve, reject);
  });
};

const createBrandNewDirectoryAsync = (path, opts) => {
  const options = opts || {};

  return new Promise((resolve, reject) => {
    fs_1.mkdir(path, options.mode)
    .then(resolve)
    .catch((err) => {
      if (err.code === 'ENOENT') {
        // Parent directory doesn't exist. Need to create it first.
        createBrandNewDirectoryAsync(pathUtil.dirname(path), options)
        .then(() => {
          // Now retry creating this directory.
          return fs_1.mkdir(path, options.mode);
        })
        .then(resolve)
        .catch((err2) => {
          if (err2.code === 'EEXIST') {
            // Hmm, something other have already created the directory?
            // No problem for us.
            resolve();
          } else {
            reject(err2);
          }
        });
      } else if (err.code === 'EEXIST') {
        // The path already exists. We're fine.
        resolve();
      } else {
        reject(err);
      }
    });
  });
};

const dirAsync = (path, passedCriteria) => {
  return new Promise((resolve, reject) => {
    const criteria = getCriteriaDefaults(passedCriteria);

    checkWhatAlreadyOccupiesPathAsync(path)
    .then((stat) => {
      if (stat !== undefined) {
        return checkExistingDirectoryFulfillsCriteriaAsync(path, stat, criteria);
      }
      return createBrandNewDirectoryAsync(path, criteria);
    })
    .then(resolve, reject);
  });
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.validateInput = validateInput;
exports.sync = dirSync;
exports.createSync = createBrandNewDirectorySync;
exports.async = dirAsync;
exports.createAsync = createBrandNewDirectoryAsync;
});

var write = createCommonjsModule(function (module, exports) {
'use strict';






const validateInput = (methodName, path, data, options) => {
  const methodSignature = `${methodName}(path, data, [options])`;
  validate.argument(methodSignature, 'path', path, ['string']);
  validate.argument(methodSignature, 'data', data, ['string', 'buffer', 'object', 'array']);
  validate.options(methodSignature, 'options', options, {
    atomic: ['boolean'],
    jsonIndent: ['number'],
  });
};

// Temporary file extensions used for atomic file overwriting.
const newExt = '.__new__';

const serializeToJsonMaybe = (data, jsonIndent) => {
  let indent = jsonIndent;
  if (typeof indent !== 'number') {
    indent = 2;
  }

  if (typeof data === 'object'
      && !Buffer.isBuffer(data)
      && data !== null) {
    return JSON.stringify(data, null, indent);
  }

  return data;
};

// ---------------------------------------------------------
// SYNC
// ---------------------------------------------------------

const writeFileSync = (path, data, options) => {
  try {
    fs_1.writeFileSync(path, data, options);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Means parent directory doesn't exist, so create it and try again.
      dir.createSync(pathUtil.dirname(path));
      fs_1.writeFileSync(path, data, options);
    } else {
      throw err;
    }
  }
};

const writeAtomicSync = (path, data, options) => {
  // we are assuming there is file on given path, and we don't want
  // to touch it until we are sure our data has been saved correctly,
  // so write the data into temporary file...
  writeFileSync(path + newExt, data, options);
  // ...next rename temp file to replace real path.
  fs_1.renameSync(path + newExt, path);
};

const writeSync = (path, data, options) => {
  const opts = options || {};
  const processedData = serializeToJsonMaybe(data, opts.jsonIndent);

  let writeStrategy = writeFileSync;
  if (opts.atomic) {
    writeStrategy = writeAtomicSync;
  }
  writeStrategy(path, processedData, { mode: opts.mode });
};

// ---------------------------------------------------------
// ASYNC
// ---------------------------------------------------------

const writeFileAsync = (path, data, options) => {
  return new Promise((resolve, reject) => {
    fs_1.writeFile(path, data, options)
    .then(resolve)
    .catch((err) => {
      // First attempt to write a file ended with error.
      // Check if this is not due to nonexistent parent directory.
      if (err.code === 'ENOENT') {
        // Parent directory doesn't exist, so create it and try again.
        dir.createAsync(pathUtil.dirname(path))
        .then(() => {
          return fs_1.writeFile(path, data, options);
        })
        .then(resolve, reject);
      } else {
        // Nope, some other error, throw it.
        reject(err);
      }
    });
  });
};

const writeAtomicAsync = (path, data, options) => {
  return new Promise((resolve, reject) => {
    // We are assuming there is file on given path, and we don't want
    // to touch it until we are sure our data has been saved correctly,
    // so write the data into temporary file...
    writeFileAsync(path + newExt, data, options)
    .then(() => {
      // ...next rename temp file to real path.
      return fs_1.rename(path + newExt, path);
    })
    .then(resolve, reject);
  });
};

const writeAsync = (path, data, options) => {
  const opts = options || {};
  const processedData = serializeToJsonMaybe(data, opts.jsonIndent);

  let writeStrategy = writeFileAsync;
  if (opts.atomic) {
    writeStrategy = writeAtomicAsync;
  }
  return writeStrategy(path, processedData, { mode: opts.mode });
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.validateInput = validateInput;
exports.sync = writeSync;
exports.async = writeAsync;
});

var append = createCommonjsModule(function (module, exports) {
'use strict';





const validateInput = (methodName, path, data, options) => {
  const methodSignature = `${methodName}(path, data, [options])`;
  validate.argument(methodSignature, 'path', path, ['string']);
  validate.argument(methodSignature, 'data', data, ['string', 'buffer']);
  validate.options(methodSignature, 'options', options, {
    mode: ['string', 'number'],
  });
};

// ---------------------------------------------------------
// SYNC
// ---------------------------------------------------------

const appendSync = (path, data, options) => {
  try {
    fs_1.appendFileSync(path, data, options);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Parent directory doesn't exist, so just pass the task to `write`,
      // which will create the folder and file.
      write.sync(path, data, options);
    } else {
      throw err;
    }
  }
};

// ---------------------------------------------------------
// ASYNC
// ---------------------------------------------------------

const appendAsync = (path, data, options) => {
  return new Promise((resolve, reject) => {
    fs_1.appendFile(path, data, options)
    .then(resolve)
    .catch((err) => {
      if (err.code === 'ENOENT') {
        // Parent directory doesn't exist, so just pass the task to `write`,
        // which will create the folder and file.
        write.async(path, data, options).then(resolve, reject);
      } else {
        reject(err);
      }
    });
  });
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.validateInput = validateInput;
exports.sync = appendSync;
exports.async = appendAsync;
});

var file = createCommonjsModule(function (module, exports) {
'use strict';






const validateInput = (methodName, path, criteria) => {
  const methodSignature = `${methodName}(path, [criteria])`;
  validate.argument(methodSignature, 'path', path, ['string']);
  validate.options(methodSignature, 'criteria', criteria, {
    content: ['string', 'buffer', 'object', 'array'],
    jsonIndent: ['number'],
    mode: ['string', 'number'],
  });
};

const getCriteriaDefaults = (passedCriteria) => {
  const criteria = passedCriteria || {};
  if (criteria.mode !== undefined) {
    criteria.mode = mode.normalizeFileMode(criteria.mode);
  }
  return criteria;
};

const generatePathOccupiedByNotFileError = (path) => {
  return new Error(`Path ${path} exists but is not a file. Halting jetpack.file() call for safety reasons.`);
};

// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------

const checkWhatAlreadyOccupiesPathSync = (path) => {
  let stat;

  try {
    stat = fs_1.statSync(path);
  } catch (err) {
    // Detection if path exists
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  if (stat && !stat.isFile()) {
    throw generatePathOccupiedByNotFileError(path);
  }

  return stat;
};

const checkExistingFileFulfillsCriteriaSync = (path, stat, criteria) => {
  const mode$$2 = mode.normalizeFileMode(stat.mode);

  const checkContent = () => {
    if (criteria.content !== undefined) {
      write.sync(path, criteria.content, {
        mode: mode$$2,
        jsonIndent: criteria.jsonIndent,
      });
      return true;
    }
    return false;
  };

  const checkMode = () => {
    if (criteria.mode !== undefined && criteria.mode !== mode$$2) {
      fs_1.chmodSync(path, criteria.mode);
    }
  };

  const contentReplaced = checkContent();
  if (!contentReplaced) {
    checkMode();
  }
};

const createBrandNewFileSync = (path, criteria) => {
  let content = '';
  if (criteria.content !== undefined) {
    content = criteria.content;
  }
  write.sync(path, content, {
    mode: criteria.mode,
    jsonIndent: criteria.jsonIndent,
  });
};

const fileSync = (path, passedCriteria) => {
  const criteria = getCriteriaDefaults(passedCriteria);
  const stat = checkWhatAlreadyOccupiesPathSync(path);
  if (stat !== undefined) {
    checkExistingFileFulfillsCriteriaSync(path, stat, criteria);
  } else {
    createBrandNewFileSync(path, criteria);
  }
};

// ---------------------------------------------------------
// Async
// ---------------------------------------------------------

const checkWhatAlreadyOccupiesPathAsync = (path) => {
  return new Promise((resolve, reject) => {
    fs_1.stat(path)
    .then((stat) => {
      if (stat.isFile()) {
        resolve(stat);
      } else {
        reject(generatePathOccupiedByNotFileError(path));
      }
    })
    .catch((err) => {
      if (err.code === 'ENOENT') {
        // Path doesn't exist.
        resolve(undefined);
      } else {
        // This is other error. Must end here.
        reject(err);
      }
    });
  });
};

const checkExistingFileFulfillsCriteriaAsync = (path, stat, criteria) => {
  const mode$$2 = mode.normalizeFileMode(stat.mode);

  const checkContent = () => {
    return new Promise((resolve, reject) => {
      if (criteria.content !== undefined) {
        write.async(path, criteria.content, {
          mode: mode$$2,
          jsonIndent: criteria.jsonIndent,
        })
        .then(() => {
          resolve(true);
        })
        .catch(reject);
      } else {
        resolve(false);
      }
    });
  };

  const checkMode = () => {
    if (criteria.mode !== undefined && criteria.mode !== mode$$2) {
      return fs_1.chmod(path, criteria.mode);
    }
    return undefined;
  };

  return checkContent()
  .then((contentReplaced) => {
    if (!contentReplaced) {
      return checkMode();
    }
    return undefined;
  });
};

const createBrandNewFileAsync = (path, criteria) => {
  let content = '';
  if (criteria.content !== undefined) {
    content = criteria.content;
  }

  return write.async(path, content, {
    mode: criteria.mode,
    jsonIndent: criteria.jsonIndent,
  });
};

const fileAsync = (path, passedCriteria) => {
  return new Promise((resolve, reject) => {
    const criteria = getCriteriaDefaults(passedCriteria);

    checkWhatAlreadyOccupiesPathAsync(path)
    .then((stat) => {
      if (stat !== undefined) {
        return checkExistingFileFulfillsCriteriaAsync(path, stat, criteria);
      }
      return createBrandNewFileAsync(path, criteria);
    })
    .then(resolve, reject);
  });
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.validateInput = validateInput;
exports.sync = fileSync;
exports.async = fileAsync;
});

var inspect = createCommonjsModule(function (module, exports) {
'use strict';






const supportedChecksumAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'];

const symlinkOptions = ['report', 'follow'];

const validateInput = (methodName, path, options) => {
  const methodSignature = `${methodName}(path, [options])`;
  validate.argument(methodSignature, 'path', path, ['string']);
  validate.options(methodSignature, 'options', options, {
    checksum: ['string'],
    mode: ['boolean'],
    times: ['boolean'],
    absolutePath: ['boolean'],
    symlinks: ['string'],
  });

  if (options && options.checksum !== undefined
    && supportedChecksumAlgorithms.indexOf(options.checksum) === -1) {
    throw new Error(`Argument "options.checksum" passed to ${methodSignature} must have one of values: ${supportedChecksumAlgorithms.join(', ')}`);
  }

  if (options && options.symlinks !== undefined
    && symlinkOptions.indexOf(options.symlinks) === -1) {
    throw new Error(`Argument "options.symlinks" passed to ${methodSignature} must have one of values: ${symlinkOptions.join(', ')}`);
  }
};

const createInspectObj = (path, options, stat) => {
  const obj = {};

  obj.name = pathUtil.basename(path);

  if (stat.isFile()) {
    obj.type = 'file';
    obj.size = stat.size;
  } else if (stat.isDirectory()) {
    obj.type = 'dir';
  } else if (stat.isSymbolicLink()) {
    obj.type = 'symlink';
  } else {
    obj.type = 'other';
  }

  if (options.mode) {
    obj.mode = stat.mode;
  }

  if (options.times) {
    obj.accessTime = stat.atime;
    obj.modifyTime = stat.mtime;
    obj.changeTime = stat.ctime;
  }

  if (options.absolutePath) {
    obj.absolutePath = path;
  }

  return obj;
};

// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------

const fileChecksum = (path, algo) => {
  const hash = crypto.createHash(algo);
  const data = fs_1.readFileSync(path);
  hash.update(data);
  return hash.digest('hex');
};

const addExtraFieldsSync = (path, inspectObj, options) => {
  if (inspectObj.type === 'file' && options.checksum) {
    inspectObj[options.checksum] = fileChecksum(path, options.checksum);
  } else if (inspectObj.type === 'symlink') {
    inspectObj.pointsAt = fs_1.readlinkSync(path);
  }
};

const inspectSync = (path, options) => {
  let statOperation = fs_1.lstatSync;
  let stat;
  const opts = options || {};

  if (opts.symlinks === 'follow') {
    statOperation = fs_1.statSync;
  }

  try {
    stat = statOperation(path);
  } catch (err) {
    // Detection if path exists
    if (err.code === 'ENOENT') {
      // Doesn't exist. Return undefined instead of throwing.
      return undefined;
    }
    throw err;
  }

  const inspectObj = createInspectObj(path, opts, stat);
  addExtraFieldsSync(path, inspectObj, opts);

  return inspectObj;
};

// ---------------------------------------------------------
// Async
// ---------------------------------------------------------

const fileChecksumAsync = (path, algo) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algo);
    const s = fs_1.createReadStream(path);
    s.on('data', (data) => {
      hash.update(data);
    });
    s.on('end', () => {
      resolve(hash.digest('hex'));
    });
    s.on('error', reject);
  });
};

const addExtraFieldsAsync = (path, inspectObj, options) => {
  if (inspectObj.type === 'file' && options.checksum) {
    return fileChecksumAsync(path, options.checksum)
    .then((checksum) => {
      inspectObj[options.checksum] = checksum;
      return inspectObj;
    });
  } else if (inspectObj.type === 'symlink') {
    return fs_1.readlink(path)
    .then((linkPath) => {
      inspectObj.pointsAt = linkPath;
      return inspectObj;
    });
  }
  return Promise.resolve(inspectObj);
};

const inspectAsync = (path, options) => {
  return new Promise((resolve, reject) => {
    let statOperation = fs_1.lstat;
    const opts = options || {};

    if (opts.symlinks === 'follow') {
      statOperation = fs_1.stat;
    }

    statOperation(path)
    .then((stat) => {
      const inspectObj = createInspectObj(path, opts, stat);
      addExtraFieldsAsync(path, inspectObj, opts)
      .then(resolve, reject);
    })
    .catch((err) => {
      // Detection if path exists
      if (err.code === 'ENOENT') {
        // Doesn't exist. Return undefined instead of throwing.
        resolve(undefined);
      } else {
        reject(err);
      }
    });
  });
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.supportedChecksumAlgorithms = supportedChecksumAlgorithms;
exports.symlinkOptions = symlinkOptions;
exports.validateInput = validateInput;
exports.sync = inspectSync;
exports.async = inspectAsync;
});

var tree_walker = createCommonjsModule(function (module, exports) {
/* eslint no-underscore-dangle:0 */

'use strict';

const Readable = stream.Readable;




// ---------------------------------------------------------
// SYNC
// ---------------------------------------------------------

const walkSync = (path, options, callback, currentLevel) => {
  const item = inspect.sync(path, options.inspectOptions);

  if (options.maxLevelsDeep === undefined) {
    options.maxLevelsDeep = Infinity;
  }

  callback(path, item);
  if (item && item.type === 'dir' && currentLevel < options.maxLevelsDeep) {
    list.sync(path).forEach((child) => {
      walkSync(path + pathUtil.sep + child, options, callback, currentLevel + 1);
    });
  }
};

const initialWalkSync = (path, options, callback) => {
  walkSync(path, options, callback, 0);
};

// ---------------------------------------------------------
// STREAM
// ---------------------------------------------------------

const walkStream = (path, options) => {
  const rs = new Readable({ objectMode: true });
  let nextTreeNode = {
    path,
    parent: undefined,
    level: 0,
  };
  let running = false;
  let readSome;

  const error = function (err) {
    rs.emit('error', err);
  };

  const findNextUnprocessedNode = (node) => {
    if (node.nextSibling) {
      return node.nextSibling;
    } else if (node.parent) {
      return findNextUnprocessedNode(node.parent);
    }
    return undefined;
  };

  const pushAndContinueMaybe = (data) => {
    const theyWantMore = rs.push(data);
    running = false;
    if (!nextTreeNode) {
      // Previous was the last node. The job is done.
      rs.push(null);
    } else if (theyWantMore) {
      readSome();
    }
  };

  if (options.maxLevelsDeep === undefined) {
    options.maxLevelsDeep = Infinity;
  }

  readSome = () => {
    const theNode = nextTreeNode;

    running = true;

    inspect.async(theNode.path, options.inspectOptions)
    .then((inspected) => {
      theNode.inspected = inspected;
      if (inspected && inspected.type === 'dir' && theNode.level < options.maxLevelsDeep) {
        list.async(theNode.path)
        .then((childrenNames) => {
          const children = childrenNames.map((name) => {
            return {
              name,
              path: theNode.path + pathUtil.sep + name,
              parent: theNode,
              level: theNode.level + 1,
            };
          });
          children.forEach((child, index) => {
            child.nextSibling = children[index + 1];
          });

          nextTreeNode = children[0] || findNextUnprocessedNode(theNode);
          pushAndContinueMaybe({ path: theNode.path, item: inspected });
        })
        .catch(error);
      } else {
        nextTreeNode = findNextUnprocessedNode(theNode);
        pushAndContinueMaybe({ path: theNode.path, item: inspected });
      }
    })
    .catch(error);
  };

  rs._read = function () {
    if (!running) {
      readSome();
    }
  };

  return rs;
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.sync = initialWalkSync;
exports.stream = walkStream;
});

var concatMap = function (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        var x = fn(xs[i], i);
        if (isArray(x)) res.push.apply(res, x);
        else res.push(x);
    }
    return res;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

'use strict';
var balancedMatch = balanced;
function balanced(a, b, str) {
  if (a instanceof RegExp) a = maybeMatch(a, str);
  if (b instanceof RegExp) b = maybeMatch(b, str);

  var r = range(a, b, str);

  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}

function maybeMatch(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}

balanced.range = range;
function range(a, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;

  if (ai >= 0 && bi > 0) {
    begs = [];
    left = str.length;

    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a, i + 1);
      } else if (begs.length == 1) {
        result = [ begs.pop(), bi ];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }

        bi = str.indexOf(b, i + 1);
      }

      i = ai < bi && ai >= 0 ? ai : bi;
    }

    if (begs.length) {
      result = [ left, right ];
    }
  }

  return result;
}

var braceExpansion = expandTop;

var escSlash = '\0SLASH'+Math.random()+'\0';
var escOpen = '\0OPEN'+Math.random()+'\0';
var escClose = '\0CLOSE'+Math.random()+'\0';
var escComma = '\0COMMA'+Math.random()+'\0';
var escPeriod = '\0PERIOD'+Math.random()+'\0';

function numeric(str) {
  return parseInt(str, 10) == str
    ? parseInt(str, 10)
    : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str.split('\\\\').join(escSlash)
            .split('\\{').join(escOpen)
            .split('\\}').join(escClose)
            .split('\\,').join(escComma)
            .split('\\.').join(escPeriod);
}

function unescapeBraces(str) {
  return str.split(escSlash).join('\\')
            .split(escOpen).join('{')
            .split(escClose).join('}')
            .split(escComma).join(',')
            .split(escPeriod).join('.');
}


// Basically just str.split(","), but handling cases
// where we have nested braced sections, which should be
// treated as individual members, like {a,{b,c},d}
function parseCommaParts(str) {
  if (!str)
    return [''];

  var parts = [];
  var m = balancedMatch('{', '}', str);

  if (!m)
    return str.split(',');

  var pre = m.pre;
  var body = m.body;
  var post = m.post;
  var p = pre.split(',');

  p[p.length-1] += '{' + body + '}';
  var postParts = parseCommaParts(post);
  if (post.length) {
    p[p.length-1] += postParts.shift();
    p.push.apply(p, postParts);
  }

  parts.push.apply(parts, p);

  return parts;
}

function expandTop(str) {
  if (!str)
    return [];

  // I don't know why Bash 4.3 does this, but it does.
  // Anything starting with {} will have the first two bytes preserved
  // but *only* at the top level, so {},a}b will not expand to anything,
  // but a{},b}c will be expanded to [a}c,abc].
  // One could argue that this is a bug in Bash, but since the goal of
  // this module is to match Bash's rules, we escape a leading {}
  if (str.substr(0, 2) === '{}') {
    str = '\\{\\}' + str.substr(2);
  }

  return expand(escapeBraces(str), true).map(unescapeBraces);
}

function embrace(str) {
  return '{' + str + '}';
}
function isPadded(el) {
  return /^-?0\d/.test(el);
}

function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}

function expand(str, isTop) {
  var expansions = [];

  var m = balancedMatch('{', '}', str);
  if (!m || /\$$/.test(m.pre)) return [str];

  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
  var isSequence = isNumericSequence || isAlphaSequence;
  var isOptions = m.body.indexOf(',') >= 0;
  if (!isSequence && !isOptions) {
    // {a},b}
    if (m.post.match(/,.*\}/)) {
      str = m.pre + '{' + m.body + escClose + m.post;
      return expand(str);
    }
    return [str];
  }

  var n;
  if (isSequence) {
    n = m.body.split(/\.\./);
  } else {
    n = parseCommaParts(m.body);
    if (n.length === 1) {
      // x{{a,b}}y ==> x{a}y x{b}y
      n = expand(n[0], false).map(embrace);
      if (n.length === 1) {
        var post = m.post.length
          ? expand(m.post, false)
          : [''];
        return post.map(function(p) {
          return m.pre + n[0] + p;
        });
      }
    }
  }

  // at this point, n is the parts, and we know it's not a comma set
  // with a single entry.

  // no need to expand pre, since it is guaranteed to be free of brace-sets
  var pre = m.pre;
  var post = m.post.length
    ? expand(m.post, false)
    : [''];

  var N;

  if (isSequence) {
    var x = numeric(n[0]);
    var y = numeric(n[1]);
    var width = Math.max(n[0].length, n[1].length);
    var incr = n.length == 3
      ? Math.abs(numeric(n[2]))
      : 1;
    var test = lte;
    var reverse = y < x;
    if (reverse) {
      incr *= -1;
      test = gte;
    }
    var pad = n.some(isPadded);

    N = [];

    for (var i = x; test(i, y); i += incr) {
      var c;
      if (isAlphaSequence) {
        c = String.fromCharCode(i);
        if (c === '\\')
          c = '';
      } else {
        c = String(i);
        if (pad) {
          var need = width - c.length;
          if (need > 0) {
            var z = new Array(need + 1).join('0');
            if (i < 0)
              c = '-' + z + c.slice(1);
            else
              c = z + c;
          }
        }
      }
      N.push(c);
    }
  } else {
    N = concatMap(n, function(el) { return expand(el, false) });
  }

  for (var j = 0; j < N.length; j++) {
    for (var k = 0; k < post.length; k++) {
      var expansion = pre + N[j] + post[k];
      if (!isTop || isSequence || expansion)
        expansions.push(expansion);
    }
  }

  return expansions;
}

var minimatch_1 = minimatch;
minimatch.Minimatch = Minimatch;

var path = { sep: '/' };
try {
  path = pathUtil;
} catch (er) {}

var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {};


var plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
};

// any single thing other than /
// don't need to escape / when using new RegExp()
var qmark = '[^/]';

// * => any number of characters
var star = qmark + '*?';

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?';

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?';

// characters that need to be escaped in RegExp.
var reSpecials = charSet('().*{}+?[]^$\\!');

// "abc" -> { a:true, b:true, c:true }
function charSet (s) {
  return s.split('').reduce(function (set, c) {
    set[c] = true;
    return set
  }, {})
}

// normalizes slashes.
var slashSplit = /\/+/;

minimatch.filter = filter;
function filter (pattern, options) {
  options = options || {};
  return function (p, i, list) {
    return minimatch(p, pattern, options)
  }
}

function ext (a, b) {
  a = a || {};
  b = b || {};
  var t = {};
  Object.keys(b).forEach(function (k) {
    t[k] = b[k];
  });
  Object.keys(a).forEach(function (k) {
    t[k] = a[k];
  });
  return t
}

minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return minimatch

  var orig = minimatch;

  var m = function minimatch (p, pattern, options) {
    return orig.minimatch(p, pattern, ext(def, options))
  };

  m.Minimatch = function Minimatch (pattern, options) {
    return new orig.Minimatch(pattern, ext(def, options))
  };

  return m
};

Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return Minimatch
  return minimatch.defaults(def).Minimatch
};

function minimatch (p, pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {};

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false
  }

  // "" only matches ""
  if (pattern.trim() === '') return p === ''

  return new Minimatch(pattern, options).match(p)
}

function Minimatch (pattern, options) {
  if (!(this instanceof Minimatch)) {
    return new Minimatch(pattern, options)
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {};
  pattern = pattern.trim();

  // windows support: need to use /, not \
  if (path.sep !== '/') {
    pattern = pattern.split(path.sep).join('/');
  }

  this.options = options;
  this.set = [];
  this.pattern = pattern;
  this.regexp = null;
  this.negate = false;
  this.comment = false;
  this.empty = false;

  // make the set of regexps etc.
  this.make();
}

Minimatch.prototype.debug = function () {};

Minimatch.prototype.make = make;
function make () {
  // don't do it more than once.
  if (this._made) return

  var pattern = this.pattern;
  var options = this.options;

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    this.comment = true;
    return
  }
  if (!pattern) {
    this.empty = true;
    return
  }

  // step 1: figure out negation, etc.
  this.parseNegate();

  // step 2: expand braces
  var set = this.globSet = this.braceExpand();

  if (options.debug) this.debug = console.error;

  this.debug(this.pattern, set);

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(slashSplit)
  });

  this.debug(this.pattern, set);

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this)
  }, this);

  this.debug(this.pattern, set);

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return s.indexOf(false) === -1
  });

  this.debug(this.pattern, set);

  this.set = set;
}

Minimatch.prototype.parseNegate = parseNegate;
function parseNegate () {
  var pattern = this.pattern;
  var negate = false;
  var options = this.options;
  var negateOffset = 0;

  if (options.nonegate) return

  for (var i = 0, l = pattern.length
    ; i < l && pattern.charAt(i) === '!'
    ; i++) {
    negate = !negate;
    negateOffset++;
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset);
  this.negate = negate;
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = function (pattern, options) {
  return braceExpand(pattern, options)
};

Minimatch.prototype.braceExpand = braceExpand;

function braceExpand (pattern, options) {
  if (!options) {
    if (this instanceof Minimatch) {
      options = this.options;
    } else {
      options = {};
    }
  }

  pattern = typeof pattern === 'undefined'
    ? this.pattern : pattern;

  if (typeof pattern === 'undefined') {
    throw new TypeError('undefined pattern')
  }

  if (options.nobrace ||
    !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  return braceExpansion(pattern)
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
Minimatch.prototype.parse = parse;
var SUBPARSE = {};
function parse (pattern, isSub) {
  if (pattern.length > 1024 * 64) {
    throw new TypeError('pattern is too long')
  }

  var options = this.options;

  // shortcuts
  if (!options.noglobstar && pattern === '**') return GLOBSTAR
  if (pattern === '') return ''

  var re = '';
  var hasMagic = !!options.nocase;
  var escaping = false;
  // ? => one single character
  var patternListStack = [];
  var negativeLists = [];
  var stateChar;
  var inClass = false;
  var reClassStart = -1;
  var classStart = -1;
  // . and .. never match anything that doesn't start with .,
  // even when options.dot is set.
  var patternStart = pattern.charAt(0) === '.' ? '' // anything
  // not (start or / followed by . or .. followed by / or end)
  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))'
  : '(?!\\.)';
  var self = this;

  function clearStateChar () {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case '*':
          re += star;
          hasMagic = true;
        break
        case '?':
          re += qmark;
          hasMagic = true;
        break
        default:
          re += '\\' + stateChar;
        break
      }
      self.debug('clearStateChar %j %j', stateChar, re);
      stateChar = false;
    }
  }

  for (var i = 0, len = pattern.length, c
    ; (i < len) && (c = pattern.charAt(i))
    ; i++) {
    this.debug('%s\t%s %s %j', pattern, i, re, c);

    // skip over any that are escaped.
    if (escaping && reSpecials[c]) {
      re += '\\' + c;
      escaping = false;
      continue
    }

    switch (c) {
      case '/':
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false

      case '\\':
        clearStateChar();
        escaping = true;
      continue

      // the various stateChar values
      // for the "extglob" stuff.
      case '?':
      case '*':
      case '+':
      case '@':
      case '!':
        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c);

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class');
          if (c === '!' && i === classStart + 1) c = '^';
          re += c;
          continue
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar);
        clearStateChar();
        stateChar = c;
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar();
      continue

      case '(':
        if (inClass) {
          re += '(';
          continue
        }

        if (!stateChar) {
          re += '\\(';
          continue
        }

        patternListStack.push({
          type: stateChar,
          start: i - 1,
          reStart: re.length,
          open: plTypes[stateChar].open,
          close: plTypes[stateChar].close
        });
        // negation is (?:(?!js)[^/]*)
        re += stateChar === '!' ? '(?:(?!(?:' : '(?:';
        this.debug('plType %j %j', stateChar, re);
        stateChar = false;
      continue

      case ')':
        if (inClass || !patternListStack.length) {
          re += '\\)';
          continue
        }

        clearStateChar();
        hasMagic = true;
        var pl = patternListStack.pop();
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        re += pl.close;
        if (pl.type === '!') {
          negativeLists.push(pl);
        }
        pl.reEnd = re.length;
      continue

      case '|':
        if (inClass || !patternListStack.length || escaping) {
          re += '\\|';
          escaping = false;
          continue
        }

        clearStateChar();
        re += '|';
      continue

      // these are mostly the same in regexp and glob
      case '[':
        // swallow any state-tracking char before the [
        clearStateChar();

        if (inClass) {
          re += '\\' + c;
          continue
        }

        inClass = true;
        classStart = i;
        reClassStart = re.length;
        re += c;
      continue

      case ']':
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += '\\' + c;
          escaping = false;
          continue
        }

        // handle the case where we left a class open.
        // "[z-a]" is valid, equivalent to "\[z-a\]"
        if (inClass) {
          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          var cs = pattern.substring(classStart + 1, i);
          try {
            
          } catch (er) {
            // not a valid class!
            var sp = this.parse(cs, SUBPARSE);
            re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]';
            hasMagic = hasMagic || sp[1];
            inClass = false;
            continue
          }
        }

        // finish up the class.
        hasMagic = true;
        inClass = false;
        re += c;
      continue

      default:
        // swallow any state char that wasn't consumed
        clearStateChar();

        if (escaping) {
          // no need
          escaping = false;
        } else if (reSpecials[c]
          && !(c === '^' && inClass)) {
          re += '\\';
        }

        re += c;

    } // switch
  } // for

  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    cs = pattern.substr(classStart + 1);
    sp = this.parse(cs, SUBPARSE);
    re = re.substr(0, reClassStart) + '\\[' + sp[0];
    hasMagic = hasMagic || sp[1];
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + pl.open.length);
    this.debug('setting tail', re, pl);
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = '\\';
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + '|'
    });

    this.debug('tail=%j\n   %s', tail, tail, pl, re);
    var t = pl.type === '*' ? star
      : pl.type === '?' ? qmark
      : '\\' + pl.type;

    hasMagic = true;
    re = re.slice(0, pl.reStart) + t + '\\(' + tail;
  }

  // handle trailing things that only matter at the very end.
  clearStateChar();
  if (escaping) {
    // trailing \\
    re += '\\\\';
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false;
  switch (re.charAt(0)) {
    case '.':
    case '[':
    case '(': addPatternStart = true;
  }

  // Hack to work around lack of negative lookbehind in JS
  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
  // like 'a.xyz.yz' doesn't match.  So, the first negative
  // lookahead, has to look ALL the way ahead, to the end of
  // the pattern.
  for (var n = negativeLists.length - 1; n > -1; n--) {
    var nl = negativeLists[n];

    var nlBefore = re.slice(0, nl.reStart);
    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
    var nlAfter = re.slice(nl.reEnd);

    nlLast += nlAfter;

    // Handle nested stuff like *(*.js|!(*.json)), where open parens
    // mean that we should *not* include the ) in the bit that is considered
    // "after" the negated section.
    var openParensBefore = nlBefore.split('(').length - 1;
    var cleanAfter = nlAfter;
    for (i = 0; i < openParensBefore; i++) {
      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '');
    }
    nlAfter = cleanAfter;

    var dollar = '';
    if (nlAfter === '' && isSub !== SUBPARSE) {
      dollar = '$';
    }
    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
    re = newRe;
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== '' && hasMagic) {
    re = '(?=.)' + re;
  }

  if (addPatternStart) {
    re = patternStart + re;
  }

  // parsing just a piece of a larger pattern.
  if (isSub === SUBPARSE) {
    return [re, hasMagic]
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return globUnescape(pattern)
  }

  var flags = options.nocase ? 'i' : '';
  try {
    var regExp = new RegExp('^' + re + '$', flags);
  } catch (er) {
    // If it was an invalid regular expression, then it can't match
    // anything.  This trick looks for a character after the end of
    // the string, which is of course impossible, except in multi-line
    // mode, but it's not a /m regex.
    return new RegExp('$.')
  }

  regExp._glob = pattern;
  regExp._src = re;

  return regExp
}

minimatch.makeRe = function (pattern, options) {
  return new Minimatch(pattern, options || {}).makeRe()
};

Minimatch.prototype.makeRe = makeRe;
function makeRe () {
  if (this.regexp || this.regexp === false) return this.regexp

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set;

  if (!set.length) {
    this.regexp = false;
    return this.regexp
  }
  var options = this.options;

  var twoStar = options.noglobstar ? star
    : options.dot ? twoStarDot
    : twoStarNoDot;
  var flags = options.nocase ? 'i' : '';

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return (p === GLOBSTAR) ? twoStar
      : (typeof p === 'string') ? regExpEscape(p)
      : p._src
    }).join('\\\/')
  }).join('|');

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = '^(?:' + re + ')$';

  // can match anything, as long as it's not this.
  if (this.negate) re = '^(?!' + re + ').*$';

  try {
    this.regexp = new RegExp(re, flags);
  } catch (ex) {
    this.regexp = false;
  }
  return this.regexp
}

minimatch.match = function (list, pattern, options) {
  options = options || {};
  var mm = new Minimatch(pattern, options);
  list = list.filter(function (f) {
    return mm.match(f)
  });
  if (mm.options.nonull && !list.length) {
    list.push(pattern);
  }
  return list
};

Minimatch.prototype.match = match;
function match (f, partial) {
  this.debug('match', f, this.pattern);
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false
  if (this.empty) return f === ''

  if (f === '/' && partial) return true

  var options = this.options;

  // windows: need to use /, not \
  if (path.sep !== '/') {
    f = f.split(path.sep).join('/');
  }

  // treat the test path as a set of pathparts.
  f = f.split(slashSplit);
  this.debug(this.pattern, 'split', f);

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set;
  this.debug(this.pattern, 'set', set);

  // Find the basename of the path by looking for the last non-empty segment
  var filename;
  var i;
  for (i = f.length - 1; i >= 0; i--) {
    filename = f[i];
    if (filename) break
  }

  for (i = 0; i < set.length; i++) {
    var pattern = set[i];
    var file = f;
    if (options.matchBase && pattern.length === 1) {
      file = [filename];
    }
    var hit = this.matchOne(file, pattern, partial);
    if (hit) {
      if (options.flipNegate) return true
      return !this.negate
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false
  return this.negate
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options;

  this.debug('matchOne',
    { 'this': this, file: file, pattern: pattern });

  this.debug('matchOne', file.length, pattern.length);

  for (var fi = 0,
      pi = 0,
      fl = file.length,
      pl = pattern.length
      ; (fi < fl) && (pi < pl)
      ; fi++, pi++) {
    this.debug('matchOne loop');
    var p = pattern[pi];
    var f = file[fi];

    this.debug(pattern, p, f);

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) return false

    if (p === GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f]);

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi;
      var pr = pi + 1;
      if (pr === pl) {
        this.debug('** at the end');
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for (; fi < fl; fi++) {
          if (file[fi] === '.' || file[fi] === '..' ||
            (!options.dot && file[fi].charAt(0) === '.')) return false
        }
        return true
      }

      // ok, let's see if we can swallow whatever we can.
      while (fr < fl) {
        var swallowee = file[fr];

        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee);

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee);
          // found a match.
          return true
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === '.' || swallowee === '..' ||
            (!options.dot && swallowee.charAt(0) === '.')) {
            this.debug('dot detected!', file, fr, pattern, pr);
            break
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue');
          fr++;
        }
      }

      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      if (partial) {
        // ran out of file
        this.debug('\n>>> no match, partial?', file, fr, pattern, pr);
        if (fr === fl) return true
      }
      return false
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit;
    if (typeof p === 'string') {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase();
      } else {
        hit = f === p;
      }
      this.debug('string match', p, f, hit);
    } else {
      hit = f.match(p);
      this.debug('pattern match', p, f, hit);
    }

    if (!hit) return false
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = (fi === fl - 1) && (file[fi] === '');
    return emptyFileEnd
  }

  // should be unreachable.
  throw new Error('wtf?')
};

// replace stuff like \* with *
function globUnescape (s) {
  return s.replace(/\\(.)/g, '$1')
}

function regExpEscape (s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

var matcher = createCommonjsModule(function (module, exports) {
'use strict';

const Minimatch = minimatch_1.Minimatch;

const convertPatternToAbsolutePath = (basePath, pattern) => {
  // All patterns without slash are left as they are, if pattern contain
  // any slash we need to turn it into absolute path.
  const hasSlash = (pattern.indexOf('/') !== -1);
  const isAbsolute = /^!?\//.test(pattern);
  const isNegated = /^!/.test(pattern);
  let separator;

  if (!isAbsolute && hasSlash) {
    // Throw out meaningful characters from the beginning ("!", "./").
    const patternWithoutFirstCharacters = pattern.replace(/^!/, '').replace(/^\.\//, '');

    if (/\/$/.test(basePath)) {
      separator = '';
    } else {
      separator = '/';
    }

    if (isNegated) {
      return `!${basePath}${separator}${patternWithoutFirstCharacters}`;
    }
    return `${basePath}${separator}${patternWithoutFirstCharacters}`;
  }

  return pattern;
};

exports.create = (basePath, patterns) => {
  let normalizedPatterns;

  if (typeof patterns === 'string') {
    normalizedPatterns = [patterns];
  } else {
    normalizedPatterns = patterns;
  }

  const matchers = normalizedPatterns.map((pattern) => {
    return convertPatternToAbsolutePath(basePath, pattern);
  })
  .map((pattern) => {
    return new Minimatch(pattern, {
      matchBase: true,
      nocomment: true,
      dot: true,
    });
  });

  const performMatch = (absolutePath) => {
    let mode = 'matching';
    let weHaveMatch = false;
    let currentMatcher;
    let i;

    for (i = 0; i < matchers.length; i += 1) {
      currentMatcher = matchers[i];

      if (currentMatcher.negate) {
        mode = 'negation';
        if (i === 0) {
          // There are only negated patterns in the set,
          // so make everything matching by default and
          // start to reject stuff.
          weHaveMatch = true;
        }
      }

      if (mode === 'negation' && weHaveMatch && !currentMatcher.match(absolutePath)) {
        // One negation match is enought to know we can reject this one.
        return false;
      }

      if (mode === 'matching' && !weHaveMatch) {
        weHaveMatch = currentMatcher.match(absolutePath);
      }
    }

    return weHaveMatch;
  };

  return performMatch;
};
});

var find = createCommonjsModule(function (module, exports) {
'use strict';







const validateInput = (methodName, path, options) => {
  const methodSignature = `${methodName}([path], options)`;
  validate.argument(methodSignature, 'path', path, ['string']);
  validate.options(methodSignature, 'options', options, {
    matching: ['string', 'array of string'],
    files: ['boolean'],
    directories: ['boolean'],
    recursive: ['boolean'],
    symlinks: ['boolean'],
  });
};

const normalizeOptions = (options) => {
  const opts = options || {};
  // defaults:
  if (opts.files === undefined) {
    opts.files = true;
  }
  if (opts.directories === undefined) {
    opts.directories = false;
  }
  if (opts.recursive === undefined) {
    opts.recursive = true;
  }
  if (opts.symlinks === undefined) {
    opts.symlinks = false;
  }
  return opts;
};

const processFoundObjects = (foundObjects, cwd) => {
  return foundObjects.map((inspectObj) => {
    return pathUtil.relative(cwd, inspectObj.absolutePath);
  });
};

const generatePathDoesntExistError = (path) => {
  const err = new Error(`Path you want to find stuff in doesn't exist ${path}`);
  err.code = 'ENOENT';
  return err;
};

const generatePathNotDirectoryError = (path) => {
  const err = new Error(`Path you want to find stuff in must be a directory ${path}`);
  err.code = 'ENOTDIR';
  return err;
};

// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------

const findSync = (path, options) => {
  const foundInspectObjects = [];
  const matchesAnyOfGlobs = matcher.create(path, options.matching);

  let maxLevelsDeep = Infinity;
  if (options.recursive === false) {
    maxLevelsDeep = 1;
  }

  tree_walker.sync(path, {
    maxLevelsDeep,
    inspectOptions: {
      absolutePath: true,
    },
  }, (itemPath, item) => {
    if (itemPath !== path && matchesAnyOfGlobs(itemPath)) {
      if ((item.type === 'file' && options.files === true)
        || (item.type === 'dir' && options.directories === true)
        || (item.type === 'symlink' && options.symlinks === true)) {
        foundInspectObjects.push(item);
      }
    }
  });

  return processFoundObjects(foundInspectObjects, options.cwd);
};

const findSyncInit = (path, options) => {
  const entryPointInspect = inspect.sync(path);
  if (entryPointInspect === undefined) {
    throw generatePathDoesntExistError(path);
  } else if (entryPointInspect.type !== 'dir') {
    throw generatePathNotDirectoryError(path);
  }

  return findSync(path, normalizeOptions(options));
};

// ---------------------------------------------------------
// Async
// ---------------------------------------------------------

const findAsync = (path, options) => {
  return new Promise((resolve, reject) => {
    const foundInspectObjects = [];
    const matchesAnyOfGlobs = matcher.create(path, options.matching);

    let maxLevelsDeep = Infinity;
    if (options.recursive === false) {
      maxLevelsDeep = 1;
    }

    const walker = tree_walker.stream(path, {
      maxLevelsDeep,
      inspectOptions: {
        absolutePath: true,
      },
    })
    .on('readable', () => {
      const data = walker.read();
      if (data && data.path !== path && matchesAnyOfGlobs(data.path)) {
        const item = data.item;
        if ((item.type === 'file' && options.files === true)
          || (item.type === 'dir' && options.directories === true)
          || (item.type === 'symlink' && options.symlinks === true)) {
          foundInspectObjects.push(item);
        }
      }
    })
    .on('error', reject)
    .on('end', () => {
      resolve(processFoundObjects(foundInspectObjects, options.cwd));
    });
  });
};

const findAsyncInit = (path, options) => {
  return inspect.async(path)
  .then((entryPointInspect) => {
    if (entryPointInspect === undefined) {
      throw generatePathDoesntExistError(path);
    } else if (entryPointInspect.type !== 'dir') {
      throw generatePathNotDirectoryError(path);
    }
    return findAsync(path, normalizeOptions(options));
  });
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.validateInput = validateInput;
exports.sync = findSyncInit;
exports.async = findAsyncInit;
});

var inspect_tree = createCommonjsModule(function (module, exports) {
'use strict';







const validateInput = (methodName, path, options) => {
  const methodSignature = `${methodName}(path, [options])`;
  validate.argument(methodSignature, 'path', path, ['string']);
  validate.options(methodSignature, 'options', options, {
    checksum: ['string'],
    relativePath: ['boolean'],
    symlinks: ['string'],
  });

  if (options && options.checksum !== undefined
    && inspect.supportedChecksumAlgorithms.indexOf(options.checksum) === -1) {
    throw new Error(`Argument "options.checksum" passed to ${methodSignature} must have one of values: ${inspect.supportedChecksumAlgorithms.join(', ')}`);
  }

  if (options && options.symlinks !== undefined
    && inspect.symlinkOptions.indexOf(options.symlinks) === -1) {
    throw new Error(`Argument "options.symlinks" passed to ${methodSignature} must have one of values: ${inspect.symlinkOptions.join(', ')}`);
  }
};

const generateTreeNodeRelativePath = (parent, path) => {
  if (!parent) {
    return '.';
  }
  return `${parent.relativePath}/${pathUtil.basename(path)}`;
};

// Creates checksum of a directory by using
// checksums and names of all its children inside.
const checksumOfDir = (inspectList, algo) => {
  const hash = crypto.createHash(algo);
  inspectList.forEach((inspectObj) => {
    hash.update(inspectObj.name + inspectObj[algo]);
  });
  return hash.digest('hex');
};

// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------

const inspectTreeNodeSync = (path, options, parent) => {
  const treeBranch = inspect.sync(path, options);

  if (treeBranch) {
    if (options.relativePath) {
      treeBranch.relativePath = generateTreeNodeRelativePath(parent, path);
    }

    if (treeBranch.type === 'dir') {
      treeBranch.size = 0;
      treeBranch.children = list.sync(path).map((filename) => {
        const subBranchPath = pathUtil.join(path, filename);
        const treeSubBranch = inspectTreeNodeSync(subBranchPath, options, treeBranch);
        // Add together all childrens' size to get directory combined size.
        treeBranch.size += treeSubBranch.size || 0;
        return treeSubBranch;
      });

      if (options.checksum) {
        treeBranch[options.checksum] = checksumOfDir(treeBranch.children, options.checksum);
      }
    }
  }

  return treeBranch;
};

const inspectTreeSync = (path, options) => {
  const opts = options || {};
  return inspectTreeNodeSync(path, opts, undefined);
};

// ---------------------------------------------------------
// Async
// ---------------------------------------------------------

const inspectTreeNodeAsync = (path, options, parent) => {
  return new Promise((resolve, reject) => {
    const inspectAllChildren = (treeBranch) => {
      return new Promise((resolve2, reject2) => {
        list.async(path).then((children) => {
          const doNext = (index) => {
            if (index === children.length) {
              if (options.checksum) {
                // We are done, but still have to calculate checksum of whole directory.
                treeBranch[options.checksum] = checksumOfDir(treeBranch.children, options.checksum);
              }
              resolve2();
            } else {
              const subPath = pathUtil.join(path, children[index]);
              inspectTreeNodeAsync(subPath, options, treeBranch)
              .then((treeSubBranch) => {
                children[index] = treeSubBranch;
                treeBranch.size += treeSubBranch.size || 0;
                doNext(index + 1);
              })
              .catch(reject2);
            }
          };

          treeBranch.children = children;
          treeBranch.size = 0;

          doNext(0);
        });
      });
    };

    inspect.async(path, options)
    .then((treeBranch) => {
      if (!treeBranch) {
        // Given path doesn't exist. We are done.
        resolve(treeBranch);
      } else {
        if (options.relativePath) {
          treeBranch.relativePath = generateTreeNodeRelativePath(parent, path);
        }

        if (treeBranch.type !== 'dir') {
          resolve(treeBranch);
        } else {
          inspectAllChildren(treeBranch)
          .then(() => {
            resolve(treeBranch);
          })
          .catch(reject);
        }
      }
    })
    .catch(reject);
  });
};

const inspectTreeAsync = (path, options) => {
  const opts = options || {};
  return inspectTreeNodeAsync(path, opts);
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.validateInput = validateInput;
exports.sync = inspectTreeSync;
exports.async = inspectTreeAsync;
});

var exists = createCommonjsModule(function (module, exports) {
'use strict';




const validateInput = (methodName, path) => {
  const methodSignature = `${methodName}(path)`;
  validate.argument(methodSignature, 'path', path, ['string']);
};

// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------

const existsSync = (path) => {
  try {
    const stat = fs_1.statSync(path);
    if (stat.isDirectory()) {
      return 'dir';
    } else if (stat.isFile()) {
      return 'file';
    }
    return 'other';
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  return false;
};

// ---------------------------------------------------------
// Async
// ---------------------------------------------------------

const existsAsync = (path) => {
  return new Promise((resolve, reject) => {
    fs_1.stat(path, (err, stat) => {
      if (err) {
        if (err.code === 'ENOENT') {
          resolve(false);
        } else {
          reject(err);
        }
      } else if (stat.isDirectory()) {
        resolve('dir');
      } else if (stat.isFile()) {
        resolve('file');
      } else {
        resolve('other');
      }
    });
  });
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.validateInput = validateInput;
exports.sync = existsSync;
exports.async = existsAsync;
});

var copy = createCommonjsModule(function (module, exports) {
'use strict';












const validateInput = (methodName, from, to, options) => {
  const methodSignature = `${methodName}(from, to, [options])`;
  validate.argument(methodSignature, 'from', from, ['string']);
  validate.argument(methodSignature, 'to', to, ['string']);
  validate.options(methodSignature, 'options', options, {
    overwrite: ['boolean', 'function'],
    matching: ['string', 'array of string'],
  });
};

const parseOptions = (options, from) => {
  const opts = options || {};
  const parsedOptions = {};

  parsedOptions.overwrite = opts.overwrite;

  if (opts.matching) {
    parsedOptions.allowedToCopy = matcher.create(from, opts.matching);
  } else {
    parsedOptions.allowedToCopy = () => {
      // Default behaviour - copy everything.
      return true;
    };
  }

  return parsedOptions;
};

const generateNoSourceError = (path) => {
  const err = new Error(`Path to copy doesn't exist ${path}`);
  err.code = 'ENOENT';
  return err;
};

const generateDestinationExistsError = (path) => {
  const err = new Error(`Destination path already exists ${path}`);
  err.code = 'EEXIST';
  return err;
};

const inspectOptions = {
  mode: true,
  symlinks: 'report',
  times: true,
  absolutePath: true,
};

const shouldThrowDestinationExistsError = (context) => {
  return typeof context.opts.overwrite !== 'function' && context.opts.overwrite !== true;
};

// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------

const checksBeforeCopyingSync = (from, to, opts) => {
  if (!exists.sync(from)) {
    throw generateNoSourceError(from);
  }

  if (exists.sync(to) && !opts.overwrite) {
    throw generateDestinationExistsError(to);
  }
};

const canOverwriteItSync = (context) => {
  if (typeof context.opts.overwrite === 'function') {
    const destInspectData = inspect.sync(context.destPath, inspectOptions);
    return context.opts.overwrite(context.srcInspectData, destInspectData);
  }
  return context.opts.overwrite === true;
};

const copyFileSync = (srcPath, destPath, mode$$2, context) => {
  const data = fs_1.readFileSync(srcPath);
  try {
    fs_1.writeFileSync(destPath, data, { mode: mode$$2, flag: 'wx' });
  } catch (err) {
    if (err.code === 'ENOENT') {
      write.sync(destPath, data, { mode: mode$$2 });
    } else if (err.code === 'EEXIST') {
      if (canOverwriteItSync(context)) {
        fs_1.writeFileSync(destPath, data, { mode: mode$$2 });
      } else if (shouldThrowDestinationExistsError(context)) {
        throw generateDestinationExistsError(context.destPath);
      }
    } else {
      throw err;
    }
  }
};

const copySymlinkSync = (from, to) => {
  const symlinkPointsAt = fs_1.readlinkSync(from);
  try {
    fs_1.symlinkSync(symlinkPointsAt, to);
  } catch (err) {
    // There is already file/symlink with this name on destination location.
    // Must erase it manually, otherwise system won't allow us to place symlink there.
    if (err.code === 'EEXIST') {
      fs_1.unlinkSync(to);
      // Retry...
      fs_1.symlinkSync(symlinkPointsAt, to);
    } else {
      throw err;
    }
  }
};

const copyItemSync = (srcPath, srcInspectData, destPath, opts) => {
  const context = { srcPath, destPath, srcInspectData, opts };
  const mode$$2 = mode.normalizeFileMode(srcInspectData.mode);
  if (srcInspectData.type === 'dir') {
    dir.createSync(destPath, { mode: mode$$2 });
  } else if (srcInspectData.type === 'file') {
    copyFileSync(srcPath, destPath, mode$$2, context);
  } else if (srcInspectData.type === 'symlink') {
    copySymlinkSync(srcPath, destPath);
  }
};

const copySync = (from, to, options) => {
  const opts = parseOptions(options, from);

  checksBeforeCopyingSync(from, to, opts);

  tree_walker.sync(from, { inspectOptions }, (srcPath, srcInspectData) => {
    const rel = pathUtil.relative(from, srcPath);
    const destPath = pathUtil.resolve(to, rel);
    if (opts.allowedToCopy(srcPath, destPath, srcInspectData)) {
      copyItemSync(srcPath, srcInspectData, destPath, opts);
    }
  });
};

// ---------------------------------------------------------
// Async
// ---------------------------------------------------------

const checksBeforeCopyingAsync = (from, to, opts) => {
  return exists.async(from)
  .then((srcPathExists) => {
    if (!srcPathExists) {
      throw generateNoSourceError(from);
    } else {
      return exists.async(to);
    }
  })
  .then((destPathExists) => {
    if (destPathExists && !opts.overwrite) {
      throw generateDestinationExistsError(to);
    }
  });
};

const canOverwriteItAsync = (context) => {
  return new Promise((resolve, reject) => {
    if (typeof context.opts.overwrite === 'function') {
      inspect.async(context.destPath, inspectOptions)
      .then((destInspectData) => {
        resolve(context.opts.overwrite(context.srcInspectData, destInspectData));
      })
      .catch(reject);
    } else {
      resolve(context.opts.overwrite === true);
    }
  });
};

const copyFileAsync = (srcPath, destPath, mode$$2, context, runOptions) => {
  return new Promise((resolve, reject) => {
    const runOpts = runOptions || {};

    let flags = 'wx';
    if (runOpts.overwrite) {
      flags = 'w';
    }

    const readStream = fs_1.createReadStream(srcPath);
    const writeStream = fs_1.createWriteStream(destPath, { mode: mode$$2, flags });

    readStream.on('error', reject);

    writeStream.on('error', (err) => {
      // Force read stream to close, since write stream errored
      // read stream serves us no purpose.
      readStream.resume();

      if (err.code === 'ENOENT') {
        // Some parent directory doesn't exits. Create it and retry.
        dir.createAsync(pathUtil.dirname(destPath))
        .then(() => {
          copyFileAsync(srcPath, destPath, mode$$2, context)
          .then(resolve, reject);
        })
        .catch(reject);
      } else if (err.code === 'EEXIST') {
        canOverwriteItAsync(context)
        .then((canOverwite) => {
          if (canOverwite) {
            copyFileAsync(srcPath, destPath, mode$$2, context, { overwrite: true })
            .then(resolve, reject);
          } else if (shouldThrowDestinationExistsError(context)) {
            reject(generateDestinationExistsError(destPath));
          } else {
            resolve();
          }
        })
        .catch(reject);
      } else {
        reject(err);
      }
    });

    writeStream.on('finish', resolve);

    readStream.pipe(writeStream);
  });
};

const copySymlinkAsync = (from, to) => {
  return fs_1.readlink(from)
  .then((symlinkPointsAt) => {
    return new Promise((resolve, reject) => {
      fs_1.symlink(symlinkPointsAt, to)
      .then(resolve)
      .catch((err) => {
        if (err.code === 'EEXIST') {
          // There is already file/symlink with this name on destination location.
          // Must erase it manually, otherwise system won't allow us to place symlink there.
          fs_1.unlink(to)
          .then(() => {
            // Retry...
            return fs_1.symlink(symlinkPointsAt, to);
          })
          .then(resolve, reject);
        } else {
          reject(err);
        }
      });
    });
  });
};

const copyItemAsync = (srcPath, srcInspectData, destPath, opts) => {
  const context = { srcPath, destPath, srcInspectData, opts };
  const mode$$2 = mode.normalizeFileMode(srcInspectData.mode);
  if (srcInspectData.type === 'dir') {
    return dir.createAsync(destPath, { mode: mode$$2 });
  } else if (srcInspectData.type === 'file') {
    return copyFileAsync(srcPath, destPath, mode$$2, context);
  } else if (srcInspectData.type === 'symlink') {
    return copySymlinkAsync(srcPath, destPath);
  }
  // Ha! This is none of supported file system entities. What now?
  // Just continuing without actually copying sounds sane.
  return Promise.resolve();
};

const copyAsync = (from, to, options) => {
  return new Promise((resolve, reject) => {
    const opts = parseOptions(options, from);

    checksBeforeCopyingAsync(from, to, opts)
    .then(() => {
      let allFilesDelivered = false;
      let filesInProgress = 0;

      const stream$$1 = tree_walker.stream(from, { inspectOptions })
      .on('readable', () => {
        const item = stream$$1.read();
        if (item) {
          const rel = pathUtil.relative(from, item.path);
          const destPath = pathUtil.resolve(to, rel);
          if (opts.allowedToCopy(item.path, item.item, destPath)) {
            filesInProgress += 1;
            copyItemAsync(item.path, item.item, destPath, opts)
            .then(() => {
              filesInProgress -= 1;
              if (allFilesDelivered && filesInProgress === 0) {
                resolve();
              }
            })
            .catch(reject);
          }
        }
      })
      .on('error', reject)
      .on('end', () => {
        allFilesDelivered = true;
        if (allFilesDelivered && filesInProgress === 0) {
          resolve();
        }
      });
    })
    .catch(reject);
  });
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.validateInput = validateInput;
exports.sync = copySync;
exports.async = copyAsync;
});

var move = createCommonjsModule(function (module, exports) {
'use strict';







const validateInput = (methodName, from, to) => {
  const methodSignature = `${methodName}(from, to)`;
  validate.argument(methodSignature, 'from', from, ['string']);
  validate.argument(methodSignature, 'to', to, ['string']);
};

const generateSourceDoesntExistError = (path) => {
  const err = new Error(`Path to move doesn't exist ${path}`);
  err.code = 'ENOENT';
  return err;
};

// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------

const moveSync = (from, to) => {
  try {
    fs_1.renameSync(from, to);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      // We can't make sense of this error. Rethrow it.
      throw err;
    } else {
      // Ok, source or destination path doesn't exist.
      // Must do more investigation.
      if (!exists.sync(from)) {
        throw generateSourceDoesntExistError(from);
      }
      if (!exists.sync(to)) {
        // Some parent directory doesn't exist. Create it.
        dir.createSync(pathUtil.dirname(to));
        // Retry the attempt
        fs_1.renameSync(from, to);
      }
    }
  }
};

// ---------------------------------------------------------
// Async
// ---------------------------------------------------------

const ensureDestinationPathExistsAsync = (to) => {
  return new Promise((resolve, reject) => {
    const destDir = pathUtil.dirname(to);
    exists.async(destDir)
    .then((dstExists) => {
      if (!dstExists) {
        dir.createAsync(destDir)
        .then(resolve, reject);
      } else {
        // Hah, no idea.
        reject();
      }
    })
    .catch(reject);
  });
};

const moveAsync = (from, to) => {
  return new Promise((resolve, reject) => {
    fs_1.rename(from, to)
    .then(resolve)
    .catch((err) => {
      if (err.code !== 'ENOENT') {
        // Something unknown. Rethrow original error.
        reject(err);
      } else {
        // Ok, source or destination path doesn't exist.
        // Must do more investigation.
        exists.async(from)
        .then((srcExists) => {
          if (!srcExists) {
            reject(generateSourceDoesntExistError(from));
          } else {
            ensureDestinationPathExistsAsync(to)
            .then(() => {
              // Retry the attempt
              return fs_1.rename(from, to);
            })
            .then(resolve, reject);
          }
        })
        .catch(reject);
      }
    });
  });
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.validateInput = validateInput;
exports.sync = moveSync;
exports.async = moveAsync;
});

var read = createCommonjsModule(function (module, exports) {
/* eslint no-console:1 */

'use strict';




const supportedReturnAs = ['utf8', 'buffer', 'json', 'jsonWithDates'];

const validateInput = (methodName, path, returnAs) => {
  const methodSignature = `${methodName}(path, returnAs)`;
  validate.argument(methodSignature, 'path', path, ['string']);
  validate.argument(methodSignature, 'returnAs', returnAs, ['string', 'undefined']);

  if (returnAs && supportedReturnAs.indexOf(returnAs) === -1) {
    throw new Error(`Argument "returnAs" passed to ${methodSignature} must have one of values: ${supportedReturnAs.join(', ')}`);
  }
};

// Matches strings generated by Date.toJSON()
// which is called to serialize date to JSON.
const jsonDateParser = (key, value) => {
  const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
  if (typeof value === 'string') {
    if (reISO.exec(value)) {
      return new Date(value);
    }
  }
  return value;
};

const makeNicerJsonParsingError = (path, err) => {
  const nicerError = new Error(`JSON parsing failed while reading ${path} [${err}]`);
  nicerError.originalError = err;
  return nicerError;
};

// ---------------------------------------------------------
// SYNC
// ---------------------------------------------------------

const readSync = (path, returnAs) => {
  const retAs = returnAs || 'utf8';
  let data;

  let encoding = 'utf8';
  if (retAs === 'buffer') {
    encoding = null;
  }

  try {
    data = fs_1.readFileSync(path, { encoding });
  } catch (err) {
    if (err.code === 'ENOENT') {
      // If file doesn't exist return undefined instead of throwing.
      return undefined;
    }
    // Otherwise rethrow the error
    throw err;
  }

  try {
    if (retAs === 'json') {
      data = JSON.parse(data);
    } else if (retAs === 'jsonWithDates') {
      data = JSON.parse(data, jsonDateParser);
    }
  } catch (err) {
    throw makeNicerJsonParsingError(path, err);
  }

  return data;
};

// ---------------------------------------------------------
// ASYNC
// ---------------------------------------------------------

const readAsync = (path, returnAs) => {
  return new Promise((resolve, reject) => {
    const retAs = returnAs || 'utf8';
    let encoding = 'utf8';
    if (retAs === 'buffer') {
      encoding = null;
    }

    fs_1.readFile(path, { encoding })
    .then((data) => {
      // Make final parsing of the data before returning.
      try {
        if (retAs === 'json') {
          resolve(JSON.parse(data));
        } else if (retAs === 'jsonWithDates') {
          resolve(JSON.parse(data, jsonDateParser));
        } else {
          resolve(data);
        }
      } catch (err) {
        reject(makeNicerJsonParsingError(path, err));
      }
    })
    .catch((err) => {
      if (err.code === 'ENOENT') {
        // If file doesn't exist return undefined instead of throwing.
        resolve(undefined);
      } else {
        // Otherwise throw
        reject(err);
      }
    });
  });
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.validateInput = validateInput;
exports.sync = readSync;
exports.async = readAsync;
});

var rename = createCommonjsModule(function (module, exports) {
'use strict';





const validateInput = (methodName, path, newName) => {
  const methodSignature = `${methodName}(path, newName)`;
  validate.argument(methodSignature, 'path', path, ['string']);
  validate.argument(methodSignature, 'newName', newName, ['string']);
};

// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------

const renameSync = (path, newName) => {
  const newPath = pathUtil.join(pathUtil.dirname(path), newName);
  move.sync(path, newPath);
};

// ---------------------------------------------------------
// Async
// ---------------------------------------------------------

const renameAsync = (path, newName) => {
  const newPath = pathUtil.join(pathUtil.dirname(path), newName);
  return move.async(path, newPath);
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.validateInput = validateInput;
exports.sync = renameSync;
exports.async = renameAsync;
});

var symlink = createCommonjsModule(function (module, exports) {
'use strict';






const validateInput = (methodName, symlinkValue, path) => {
  const methodSignature = `${methodName}(symlinkValue, path)`;
  validate.argument(methodSignature, 'symlinkValue', symlinkValue, ['string']);
  validate.argument(methodSignature, 'path', path, ['string']);
};

// ---------------------------------------------------------
// Sync
// ---------------------------------------------------------

const symlinkSync = (symlinkValue, path) => {
  try {
    fs_1.symlinkSync(symlinkValue, path);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Parent directories don't exist. Just create them and rety.
      dir.createSync(pathUtil.dirname(path));
      fs_1.symlinkSync(symlinkValue, path);
    } else {
      throw err;
    }
  }
};

// ---------------------------------------------------------
// Async
// ---------------------------------------------------------

const symlinkAsync = (symlinkValue, path) => {
  return new Promise((resolve, reject) => {
    fs_1.symlink(symlinkValue, path)
    .then(resolve)
    .catch((err) => {
      if (err.code === 'ENOENT') {
        // Parent directories don't exist. Just create them and rety.
        dir.createAsync(pathUtil.dirname(path))
        .then(() => {
          return fs_1.symlink(symlinkValue, path);
        })
        .then(resolve, reject);
      } else {
        reject(err);
      }
    });
  });
};

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

exports.validateInput = validateInput;
exports.sync = symlinkSync;
exports.async = symlinkAsync;
});

'use strict';



var createWriteStream = fs.createWriteStream;
var createReadStream = fs.createReadStream;

var streams = {
	createWriteStream: createWriteStream,
	createReadStream: createReadStream
};

var jetpack$1 = createCommonjsModule(function (module) {
/* eslint no-param-reassign:0 */

'use strict';




















// The Jetpack Context object.
// It provides the public API, and resolves all paths regarding to
// passed cwdPath, or default process.cwd() if cwdPath was not specified.
const jetpackContext = (cwdPath) => {
  const getCwdPath = () => {
    return cwdPath || process.cwd();
  };

  const cwd = function () {
    // return current CWD if no arguments specified...
    if (arguments.length === 0) {
      return getCwdPath();
    }

    // ...create new CWD context otherwise
    const args = Array.prototype.slice.call(arguments);
    const pathParts = [getCwdPath()].concat(args);
    return jetpackContext(pathUtil.resolve.apply(null, pathParts));
  };

  // resolves path to inner CWD path of this jetpack instance
  const resolvePath = (path) => {
    return pathUtil.resolve(getCwdPath(), path);
  };

  const getPath = function () {
    // add CWD base path as first element of arguments array
    Array.prototype.unshift.call(arguments, getCwdPath());
    return pathUtil.resolve.apply(null, arguments);
  };

  const normalizeOptions = (options) => {
    const opts = options || {};
    opts.cwd = getCwdPath();
    return opts;
  };

  // API

  const api = {
    cwd,
    path: getPath,

    append: (path, data, options) => {
      append.validateInput('append', path, data, options);
      append.sync(resolvePath(path), data, options);
    },
    appendAsync: (path, data, options) => {
      append.validateInput('appendAsync', path, data, options);
      return append.async(resolvePath(path), data, options);
    },

    copy: (from, to, options) => {
      copy.validateInput('copy', from, to, options);
      copy.sync(resolvePath(from), resolvePath(to), options);
    },
    copyAsync: (from, to, options) => {
      copy.validateInput('copyAsync', from, to, options);
      return copy.async(resolvePath(from), resolvePath(to), options);
    },

    createWriteStream: (path, options) => {
      return streams.createWriteStream(resolvePath(path), options);
    },
    createReadStream: (path, options) => {
      return streams.createReadStream(resolvePath(path), options);
    },

    dir: (path, criteria) => {
      dir.validateInput('dir', path, criteria);
      const normalizedPath = resolvePath(path);
      dir.sync(normalizedPath, criteria);
      return cwd(normalizedPath);
    },
    dirAsync: (path, criteria) => {
      dir.validateInput('dirAsync', path, criteria);
      return new Promise((resolve, reject) => {
        const normalizedPath = resolvePath(path);
        dir.async(normalizedPath, criteria)
        .then(() => {
          resolve(cwd(normalizedPath));
        }, reject);
      });
    },

    exists: (path) => {
      exists.validateInput('exists', path);
      return exists.sync(resolvePath(path));
    },
    existsAsync: (path) => {
      exists.validateInput('existsAsync', path);
      return exists.async(resolvePath(path));
    },

    file: (path, criteria) => {
      file.validateInput('file', path, criteria);
      file.sync(resolvePath(path), criteria);
      return api;
    },
    fileAsync: (path, criteria) => {
      file.validateInput('fileAsync', path, criteria);
      return new Promise((resolve, reject) => {
        file.async(resolvePath(path), criteria)
        .then(() => {
          resolve(api);
        }, reject);
      });
    },

    find: (startPath, options) => {
      // startPath is optional parameter, if not specified move rest of params
      // to proper places and default startPath to CWD.
      if (typeof options === 'undefined' && typeof startPath === 'object') {
        options = startPath;
        startPath = '.';
      }
      find.validateInput('find', startPath, options);
      return find.sync(resolvePath(startPath), normalizeOptions(options));
    },
    findAsync: (startPath, options) => {
      // startPath is optional parameter, if not specified move rest of params
      // to proper places and default startPath to CWD.
      if (typeof options === 'undefined' && typeof startPath === 'object') {
        options = startPath;
        startPath = '.';
      }
      find.validateInput('findAsync', startPath, options);
      return find.async(resolvePath(startPath), normalizeOptions(options));
    },

    inspect: (path, fieldsToInclude) => {
      inspect.validateInput('inspect', path, fieldsToInclude);
      return inspect.sync(resolvePath(path), fieldsToInclude);
    },
    inspectAsync: (path, fieldsToInclude) => {
      inspect.validateInput('inspectAsync', path, fieldsToInclude);
      return inspect.async(resolvePath(path), fieldsToInclude);
    },

    inspectTree: (path, options) => {
      inspect_tree.validateInput('inspectTree', path, options);
      return inspect_tree.sync(resolvePath(path), options);
    },
    inspectTreeAsync: (path, options) => {
      inspect_tree.validateInput('inspectTreeAsync', path, options);
      return inspect_tree.async(resolvePath(path), options);
    },

    list: (path) => {
      list.validateInput('list', path);
      return list.sync(resolvePath(path || '.'));
    },
    listAsync: (path) => {
      list.validateInput('listAsync', path);
      return list.async(resolvePath(path || '.'));
    },

    move: (from, to) => {
      move.validateInput('move', from, to);
      move.sync(resolvePath(from), resolvePath(to));
    },
    moveAsync: (from, to) => {
      move.validateInput('moveAsync', from, to);
      return move.async(resolvePath(from), resolvePath(to));
    },

    read: (path, returnAs) => {
      read.validateInput('read', path, returnAs);
      return read.sync(resolvePath(path), returnAs);
    },
    readAsync: (path, returnAs) => {
      read.validateInput('readAsync', path, returnAs);
      return read.async(resolvePath(path), returnAs);
    },

    remove: (path) => {
      remove.validateInput('remove', path);
      // If path not specified defaults to CWD
      remove.sync(resolvePath(path || '.'));
    },
    removeAsync: (path) => {
      remove.validateInput('removeAsync', path);
      // If path not specified defaults to CWD
      return remove.async(resolvePath(path || '.'));
    },

    rename: (path, newName) => {
      rename.validateInput('rename', path, newName);
      rename.sync(resolvePath(path), newName);
    },
    renameAsync: (path, newName) => {
      rename.validateInput('renameAsync', path, newName);
      return rename.async(resolvePath(path), newName);
    },

    symlink: (symlinkValue, path) => {
      symlink.validateInput('symlink', symlinkValue, path);
      symlink.sync(symlinkValue, resolvePath(path));
    },
    symlinkAsync: (symlinkValue, path) => {
      symlink.validateInput('symlinkAsync', symlinkValue, path);
      return symlink.async(symlinkValue, resolvePath(path));
    },

    write: (path, data, options) => {
      write.validateInput('write', path, data, options);
      write.sync(resolvePath(path), data, options);
    },
    writeAsync: (path, data, options) => {
      write.validateInput('writeAsync', path, data, options);
      return write.async(resolvePath(path), data, options);
    },
  };

  if (util.inspect.custom !== undefined) {
    // Without this console.log(jetpack) throws obscure error. Details:
    // https://github.com/szwacz/fs-jetpack/issues/29
    // https://nodejs.org/api/util.html#util_custom_inspection_functions_on_objects
    api[util.inspect.custom] = () => {
      return `[fs-jetpack CWD: ${getCwdPath()}]`;
    };
  }

  return api;
};

module.exports = jetpackContext;
});

'use strict';



var main = jetpack$1();

const ROOT_ID = 'root';







const TEXT = {
  TITLE: 'Image Browser',
  ROOT_FOLDER: 'Root Folder',
  PREVIEW: 'Sending Preview',
  SEND_TO_EDITOR: 'Send to Editor',
  REQUIRED: 'Field is required',
  BUTTON: {
    CHOOSE: 'Choose',
    SEND: 'Send',
    DELETE_FILE: 'Delete File',
    DELETE_FOLDER: 'Delete Folder',
    NEW_FOLDER: 'New Folder',
    SEND_EDITOR: 'Send to Editor',
    SUBMIT: 'Submit',
    CONFIRM: 'Confirm',
    CANCEL: 'Cancel'
  },
  FILE: {
    TOTAL: 'Total Files:',
    DEL: 'Delete File',
    DELS: 'Delete Files'
  },
  FOLDER: {
    NEW: 'New Folder',
    DEL: 'Delete Folder',
    CREATION: 'This folder will be created inside:',
    VALIDATION: [
      'Only <strong>letters, numbers</strong>',
      ' and the following characters: <span class="highlight">- _</span>'
    ].join(''),
    DELETION: [
      '<p>This folder <span>%1</span>',
      ' will be removed with all its contents: </p>',
      '<p>Total Files: <span>%2</span>',
      ' &mdash; Total Subfolders: <span>%3</span></p>'
    ].join('')
  },
  ALERT: {
    IMAGE: {
      NOT_MIN_SIZE: 'Only images with minimum %1 x %2!'
    },
    UPLOAD: {
      SENDING: 'An upload is already in progress!',
      NONE: 'No file!',
      SENT: 'All done!'
    }
  },
  API: {
    MESSAGES: {
      FOLDER: {
        CREATED: 'Folder created!',
        RENAMED: 'Folder renamed!',
        REMOVED: 'Folder removed!',
        EXISTS: 'This folder already exists!'
      },
      FILE: {
        REMOVED: 'File(s) removed!'
      }
    }
  }
};

const ROUTES = {
  FILES: {
    ALL: '/files',
    UPLOAD: '/files',
    REMOVE: '/files'
  },
  FOLDER: {
    CREATE: '/folder',
    EDIT: '/folder',
    REMOVE: '/folder'
  }
};

/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */


function ID() {
  return Math.random().toString(36).substr(2, 9);
}

async function getTree(dir, options = {}, parents = [], parentId) {
  const root = pathUtil.resolve(process.env.npm_package_config_ROOT_DIR);
  const staticPath = process.env.npm_package_config_STATIC_PATH || '/static';

  const results = { files: [], folders: {}};
  const files = main.list(dir);

  if (parentId) {
    parents = parents.concat(parentId);
  } else {
    parents.push(ROOT_ID);
  }

  if (!files) return { error: `Directory '${dir}' not found.` };

  while (files.length > 0) {
    const f = files.pop();
    const file = pathUtil.resolve(dir, f);
    const stat = fs.statSync(file);
    if (!file) break;

    if (stat && stat.isDirectory()) {
      const id = ID();
      const recursive = await getTree(file, options, parents, id);

      results.folders[id] = {
        parents,
        name: pathUtil.basename(file),
        files: recursive.files,
        folders: recursive.folders
      };

    } else if (stat && stat.isFile()) {
      const relativeDir = dir.replace(root, '').split(pathUtil.sep).join('/');
      const ext = pathUtil.extname(file).toLowerCase();
      const fileObj = {
        size: stat.size,
        name: pathUtil.basename(file),
        extension: ext,
        path: staticPath + relativeDir
      };

      if (options.extensions || options.exclude) {
        if (options.extensions.includes(ext)) {
          results.files.push(fileObj);
        }
      } else {
        results.files.push(fileObj);
      }
    }
  }
  return results;
}

function removeFiles(folder, files) {
  const path = (f) => pathUtil.join(folder, f);
  const first = files.pop();

  if (!files.length) {
    return unlink(path(first));
  }

  return files.reduce((promise, file) => {
    return promise.then(unlink(path(file)), console.error);
  }, unlink(path(first)));
}


function unlink(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => err ? reject(err) : resolve());
  });
}

function removeFolder(path) {
  return new Promise((resolve, reject) => {
    main.remove(path);
    resolve();
  });
}

function createFolder(dir) {
  return new Promise((resolve, reject) => {
    if (main.exists(dir) === false) {
      main.dirAsync(dir).then(resolve).catch(reject);
    } else {
      reject({ message: TEXT.API.MESSAGES.FOLDER.EXISTS });
    }
  });
}

const resolve = file => pathUtil.resolve(__dirname, file);
const root = pathUtil.resolve(process.env.npm_package_config_ROOT_DIR);
const staticPath = process.env.npm_package_config_STATIC_PATH || '/static';

const routes = [
  {
    method: 'GET',
    path: ROUTES.FILES.ALL,
    handler: (request, reply) => {
      return getTree(root)
        .then(reply)
        .catch(console.error);
    }
  },
  {
    method: 'POST',
    path: ROUTES.FILES.UPLOAD,
    config: {
      payload: {
        maxBytes: 10 * 1024 * 1024,
        output: 'stream',
        allow: 'multipart/form-data',
        parse: true
      }
    },
    handler: (request, reply) => {
      const { id, name, file, directory } = request.payload;
      if (file) {
        const path = `${root}/${directory}/${name}`;
        const fileStream = fs.createWriteStream(path);

        file.pipe(fileStream);
        file.on('error', err => console.error);
        file.on('end', () => {
          const stat = fs.statSync(path);
          const fileObj = {
            id,
            name,
            size: stat.size,
            extension: pathUtil.extname(path).toLowerCase(),
            path: pathUtil.join(staticPath, directory)
          };
          reply(fileObj);
        });
      }
    }
  },
  {
    method: 'PATCH',
    path: ROUTES.FILES.REMOVE,
    handler: (request, reply) => {
      const message = TEXT.API.MESSAGES.FILE.REMOVED;
      const folder = pathUtil.join(root, request.payload.folder);
      return removeFiles(folder, request.payload.files)
        .then(() => reply({ message }))
        .catch(err => reply(Boom.notAcceptable(err.message)));
    }
  },
  {
    method: 'PATCH',
    path: ROUTES.FOLDER.REMOVE,
    handler: (request, reply) => {
      const message = TEXT.API.MESSAGES.FOLDER.REMOVED;
      const path = pathUtil.join(root, request.payload.path);
      console.log('folder remove', path);
      return removeFolder(path)
        .then(() => {

          console.log('then handler ...... ', message);
          reply({ message });
        })
        .catch(err => {
          console.log('catch handler ...... ', err);
          reply(Boom.notAcceptable(err.message));
        });
    }
  },
  {
    method: 'POST',
    path: ROUTES.FOLDER.CREATE,
    handler: (request, reply) => {
      const dir = pathUtil.join(root, request.payload.path);
      const message = TEXT.API.MESSAGES.FOLDER.CREATED;
      return createFolder(dir)
        .then(() => reply({ message }))
        .catch(err => reply(Boom.notAcceptable(err.message)));
    }
  },
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
      reply.file(resolve('../examples/index.html'));
    }
  },
  {
    method: 'GET',
    path: `${staticPath}/{p*}`,
    handler: {
      directory: {
        path: [
          resolve('../examples'),
          resolve('../examples/_uploads'),
          resolve('../dist')
        ]
      }
    }
  }
];

const router = {
  register: (server, options, next) => {
    server.route(routes);
    next();
  }
};

router.register.attributes = { name: 'routes' };

const server = new Hapi.Server();

const isProd = process.env.NODE_ENV === 'production';
const port = process.env.npm_package_config_PORT || process.env.PORT || 3000;

// const host = 'localhost';
const options = {
  ops: { interval: 10000 },
  reporters: {
    console: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ log: '*', response: '*', request: '*' }]
      },
      { module: 'good-console' },
      'stdout'
    ]
  }
};

server.connection({ port, routes: { cors: true }});
server.register([
  { register: Inert },
  { register: router },
  { register: Good, options }
], (err) => {
  if (err) return console.error(err);

  server.start(() => {
    console.info(`Server started at ${ server.info.uri }`);

    if (!isProd) {
      const bs = BrowserSync.create();
      bs.init({
        ui: false,
        notify: false,
        logLevel: 'info',
        proxy: 'localhost:' + port,
        files: ['examples/index.html', 'dist/filebrowser.js']
      });
    }
  });
});
