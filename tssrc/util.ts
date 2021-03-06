// ## Util
// #### Utility methods
// ------------------

let NEXT_UNIQUE_ID = 1; // An auto-incremented value

export let Util = {
  // Copies default values. First, overwrite undefined attributes of `obj` from
  // `opts`. Second, overwrite undefined attributes of `obj` from `defaults`.
  // defaults: (obj, opts, defaults) ->
  //   for prop of opts
  //     if not obj[prop]? then obj[prop] = opts[prop]
  //   for prop of defaults
  //     if not obj[prop]? then obj[prop] = defaults[prop]

  // Returns `true` iff the supplied `Arrays` are the same size and contain the
  // same values.
  arraysEqual: (a: any[], b: any[]) => {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  },
  // Returns an ID which is unique to this instance of the library
  uniqueId: (prefix = '') => {
    return prefix + NEXT_UNIQUE_ID++;
  },

  // Accept a DOM element or a string. If a string is provided, we assume it is
  // the id of an element, which we return.
  element: (elementOrString: string | HTMLElement) => {
    if (typeof elementOrString === 'string') {
      return document.getElementById(elementOrString) as HTMLElement;
    } else {
      return elementOrString as HTMLElement;
    }
  },
};
