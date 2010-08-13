/**
 * Array.new provides overloaded [[Get]] and [[Put]]
 * with handling negative indices of arrays.
 *
 * Since from ES5 `Array.prototype` (and similar) are
 * not [[Configurable]] and not [[Writable]] we cannot
 * optimize such negative indices placing their handling
 * directly on `Array.prototype`. Therefore, we handle them
 * on array instances.
 *
 * Example:
 *
 * @see http://github.com/DmitrySoshnikov/es-laboratory/blob/master/examples/array-negative-indices.js
 *
 *   var a = Array.new(1, 2, 3);
 *
 *   console.log(a[-1]); // 3
 *   console.log(a[-2]); // 2
 *
 *   a[-1] = 10;
 *   console.log(a); // 1,2,10
 *   console.log(a[-1]); // 10
 *
 * @author Dmitry A. Soshnikov <dmitry.soshnikov@gmail.com>
 *
 * (C) 2010 Mit Style License
 *
 */

// denendencies
load("../src/es6.js");

(function initArrayNew() {

  // helpers
  function isArrayIndex(name) {
    // this consider also negative indecies, i.e.
    // toInt32: x | 0. To consider only positive
    // indices, use toUInt32: x >>> 0
    return ("" + (Number(name) | 0) === name);
  }

  /**
   * Array.new
   * @param {Variant} length | items
   */
  Object.defineProperty(Array, "new", {
    value: function objectNew(/* length | items */) {

      // a new array
      var array = Array.apply(Array, arguments);

      // internal proxy handler
      var handler = Proxy.noopHandler(array);

      handler.get = function arrayGet(r, name) {
        // handle negative indecies
        if (isArrayIndex(name) && name < 0) {
          var index = array.length - (-name);
          // to avoid recursion
          return index < 0 ? void 0 : array[index];
        }
        return array[name];
      };

      handler.set = function arraySet(r, name, value) {
        // handle negative indecies
        if (isArrayIndex(name) && name < 0) {
          var index = array.length - (-name);
          if (index < 0) {
            throw RangeError("Wrong offset: " + name);
          }
          return array[index] = value;
        }
        return array[name] = value;
      };

      // a proxied object
      return Proxy.create(handler, Object.getPrototypeOf(array));
    }
  });

})();
