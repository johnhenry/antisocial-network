// invalidKey.ts
export const INVALID_KEY: unique symbol = Symbol("INVALID_KEY");

/**
 * Copies specified keys from the source object to the target object.
 * If INVALID_KEY is provided as the first key, all keys from the source are copied.
 *
 * @param {Object} target - The object to copy keys into.
 * @param {Object} source - The object to copy keys from.
 * @param {...string} keys - The keys to copy. Use INVALID_KEY to copy all keys.
 * @returns {Object} - The target object.
 */
export const pick = <T extends object, K extends keyof T | typeof INVALID_KEY>(
  target: T,
  source: T,
  ...keys: (K | typeof INVALID_KEY)[]
): T => {
  if (keys[0] === INVALID_KEY) {
    Object.assign(target, source);
  } else {
    Object.assign(
      target,
      Object.fromEntries(
        Object.entries(source).filter(([key]) => keys.includes(key as K)),
      ),
    );
  }
  return target;
};

/**
 * Removes specified keys from the target object.
 * If INVALID_KEY is provided as the first key, all keys are removed from the target.
 *
 * @param {Object} target - The object to remove keys from.
 * @param {...string} keys - The keys to remove. Use INVALID_KEY to remove all keys.
 * @returns {Object} - The target object.
 */
export const omit = <T extends object, K extends keyof T>(
  target: T,
  ...keys: (K | typeof INVALID_KEY)[]
): T => {
  if (keys[0] === INVALID_KEY) {
    for (let key in target) {
      if (target.hasOwnProperty(key)) {
        delete target[key as keyof T];
      }
    }
  } else {
    keys.forEach((key) => {
      if (key in target) {
        delete target[key as keyof T];
      }
    });
  }
  return target;
};

/**
 * Removes keys that were added by the pick function from the target object.
 * This is the inverse operation of pick.
 *
 * @param {Object} target - The object to remove keys from.
 * @param {Object} source - The object that was the source in the pick operation.
 * @param {...string} keys - The keys to remove. Use INVALID_KEY to remove all keys.
 * @returns {Object} - The target object.
 */
export const inversePick = <T extends object, K extends keyof T>(
  target: T,
  source: T,
  ...keys: (K | typeof INVALID_KEY)[]
): T => {
  if (keys[0] === INVALID_KEY) {
    for (let key in source) {
      delete target[key];
    }
  } else {
    keys.forEach((key) => {
      if (key in target) {
        delete target[key as keyof T];
      }
    });
  }
  return target;
};

/**
 * Restores keys that were removed by the omit function from the target object.
 * This is the inverse operation of omit.
 *
 * @param {Object} target - The object to restore keys to.
 * @param {Object} source - The object that contains the original values.
 * @param {...string} keys - The keys to restore. Use INVALID_KEY to restore all keys.
 * @returns {Object} - The target object.
 */
export const inverseOmit = <T extends object, K extends keyof T>(
  target: T,
  source: T,
  ...keys: (K | typeof INVALID_KEY)[]
): T => {
  if (keys[0] === INVALID_KEY) {
    Object.assign(target, source);
  } else {
    keys.forEach((key) => {
      if (key in source && !(key in target)) {
        if (typeof key !== "symbol") {
          target[key] = source[key];
        }
      }
    });
  }
  return target;
};

/**
 * Copies all keys from the source object to the target object, except the specified ones.
 *
 * @param {Object} target - The object to copy keys into.
 * @param {Object} source - The object to copy keys from.
 * @param {...string} keys - The keys to exclude from copying.
 * @returns {Object} - The target object.
 */
export const pickAllExcept = <T extends object, K extends keyof T>(
  target: T,
  source: T,
  ...keys: K[]
): T => {
  Object.assign(
    target,
    Object.fromEntries(
      Object.entries(source).filter(([key]) => !keys.includes(key as K)),
    ),
  );
  return target;
};

/**
 * Removes all keys from the target object, except the specified ones.
 *
 * @param {Object} target - The object to remove keys from.
 * @param {...string} keys - The keys to retain.
 * @returns {Object} - The target object.
 */
export const removeAllExcept = <T extends object, K extends keyof T>(
  target: T,
  ...keys: K[]
): T => {
  Object.keys(target).forEach((key) => {
    if (!keys.includes(key as K)) {
      delete target[key as keyof T];
    }
  });
  return target;
};

/**
 * Finds the difference between two objects, returning an array of keys that are present
 * in one object but not the other.
 *
 * @param {Object} obj1 - The first object.
 * @param {Object} obj2 - The second object.
 * @returns {string[]} - An array of keys that differ between the two objects.
 */
export const diff = <T extends object>(obj1: T, obj2: T): (keyof T)[] => {
  const diffKeys: (keyof T)[] = [];
  for (let key in obj1) {
    if (!(key in obj2)) diffKeys.push(key);
  }
  for (let key in obj2) {
    if (!(key in obj1)) diffKeys.push(key);
  }
  return diffKeys;
};
// /**
//  * Special value used to trigger specific behaviors in certain functions.
//  * It is intentionally designed to throw an error when used as a key in an object.
//  */
// export const INVALID_KEY = {
//   toString() {
//     throw new Error("Invalid key used as a trigger");
//   },
// };

// /**
//  * Copies specified keys from the source object to the target object.
//  * If INVALID_KEY is provided as the first key, all keys from the source are copied.
//  *
//  * @param {Object} target - The object to copy keys into.
//  * @param {Object} source - The object to copy keys from.
//  * @param {...string} keys - The keys to copy. Use INVALID_KEY to copy all keys.
//  * @returns {Object} - The target object.
//  */
// export const pick = (target, source, ...keys) => {
//   if (keys[0] === INVALID_KEY) {
//     Object.assign(target, source);
//   } else {
//     Object.assign(
//       target,
//       Object.fromEntries(
//         Object.entries(source).filter(([key]) => keys.includes(key)),
//       ),
//     );
//   }
//   return target;
// };

// /**
//  * Removes specified keys from the target object.
//  * If INVALID_KEY is provided as the first key, all keys are removed from the target.
//  *
//  * @param {Object} target - The object to remove keys from.
//  * @param {...string} keys - The keys to remove. Use INVALID_KEY to remove all keys.
//  * @returns {Object} - The target object.
//  */
// export const omit = (target, ...keys) => {
//   if (keys[0] === INVALID_KEY) {
//     for (let key in target) {
//       delete target[key];
//     }
//   } else {
//     keys.forEach((key) => {
//       if (key in target) {
//         delete target[key];
//       }
//     });
//   }
//   return target;
// };

// /**
//  * Removes keys that were added by the pick function from the target object.
//  * This is the inverse operation of pick.
//  *
//  * @param {Object} target - The object to remove keys from.
//  * @param {Object} source - The object that was the source in the pick operation.
//  * @param {...string} keys - The keys to remove. Use INVALID_KEY to remove all keys.
//  * @returns {Object} - The target object.
//  */
// export const inversePick = (target, source, ...keys) => {
//   if (keys[0] === INVALID_KEY) {
//     for (let key in source) {
//       delete target[key];
//     }
//   } else {
//     keys.forEach((key) => {
//       if (key in target) {
//         delete target[key];
//       }
//     });
//   }
//   return target;
// };

// /**
//  * Restores keys that were removed by the omit function from the target object.
//  * This is the inverse operation of omit.
//  *
//  * @param {Object} target - The object to restore keys to.
//  * @param {Object} source - The object that contains the original values.
//  * @param {...string} keys - The keys to restore. Use INVALID_KEY to restore all keys.
//  * @returns {Object} - The target object.
//  */
// export const inverseOmit = (target, source, ...keys) => {
//   if (keys[0] === INVALID_KEY) {
//     Object.assign(target, source);
//   } else {
//     keys.forEach((key) => {
//       if (key in source && !(key in target)) {
//         target[key] = source[key];
//       }
//     });
//   }
//   return target;
// };

// /**
//  * Copies all keys from the source object to the target object, except the specified ones.
//  *
//  * @param {Object} target - The object to copy keys into.
//  * @param {Object} source - The object to copy keys from.
//  * @param {...string} keys - The keys to exclude from copying.
//  * @returns {Object} - The target object.
//  */
// export const pickAllExcept = (target, source, ...keys) => {
//   Object.assign(
//     target,
//     Object.fromEntries(
//       Object.entries(source).filter(([key]) => !keys.includes(key)),
//     ),
//   );
//   return target;
// };

// /**
//  * Removes all keys from the target object, except the specified ones.
//  *
//  * @param {Object} target - The object to remove keys from.
//  * @param {...string} keys - The keys to retain.
//  * @returns {Object} - The target object.
//  */
// export const removeAllExcept = (target, ...keys) => {
//   Object.keys(target).forEach((key) => {
//     if (!keys.includes(key)) {
//       delete target[key];
//     }
//   });
//   return target;
// };

// /**
//  * Finds the difference between two objects, returning an array of keys that are present
//  * in one object but not the other.
//  *
//  * @param {Object} obj1 - The first object.
//  * @param {Object} obj2 - The second object.
//  * @returns {string[]} - An array of keys that differ between the two objects.
//  */
// export const diff = (obj1, obj2) => {
//   const diffKeys = [];
//   for (let key in obj1) {
//     if (!(key in obj2)) diffKeys.push(key);
//   }
//   for (let key in obj2) {
//     if (!(key in obj1)) diffKeys.push(key);
//   }
//   return diffKeys;
// };
