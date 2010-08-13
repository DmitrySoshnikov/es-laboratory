/**
 * Object.new with handling noSuchMethod and noSuchProperty. Besides,
 * all other meta-hooks (get, set, delete, etc.) are available.
 * The meta-level is stratified from the normal-level.
 *
 * Example:
 *
 *  var foo = Object.new({
 *    data:  {...} // normal-level, descriptor
 *    meta:  {...} // meta-level
 *    proto: {...} // prototype of an object
 *  });
 *
 * @see also http://github.com/DmitrySoshnikov/es-laboratory/blob/master/examples/noSuchMethod.js
 * @see also http://github.com/DmitrySoshnikov/es-laboratory/blob/master/src/hook.js
 *
 * @author Dmitry A. Soshnikov <dmitry.soshnikov@gmail.com>
 *
 * (C) 2010 Mit Style License
 *
 */

load("../src/lib.js");
load("../src/es6.js");

(function initObjectNew() {

  // helpers
  var slice = Array.prototype.slice;

  // an activator of noSuchMethod;
  // to have only one function and do not
  // create every time new (to keep === invariant),
  // for that a missed property name is kept as a
  // property of `activator` function and set on `get`
  function activator() {
    if (typeof activator.__noSuchMethod == "function") {
      var args = slice.call(arguments, 0);
      return activator.__noSuchMethod.call(this, activator.__property, args);
    };
  };

  /**
   * Object.new
   * @param {Object} settings
   *    - data {Object} object's properties
   *    - meta {Object} meta-level properties
   *    - proto {Object} prototype of an object
   */
  Object.defineProperty(Object, "new", {
    value: function objectNew(settings) {

      // extract settings
      ({data, meta, proto}) = settings;

      // a new object
      var object = Object.create(proto, data);

      // internal proxy handler
      var handler = Object.extend(meta, Proxy.noopHandler(object));

      // handle missed properties
      if (meta.noSuchProperty || meta.noSuchMethod) {
        var getHook = handler.get;
        handler.get = function objectGet(r, name) {
          if (!object[name]) {
            // activate noSuchProperty first
            if (typeof meta.noSuchProperty == "function") {
              meta.noSuchProperty.call(object, name);
            }

            // we do not have `isCall` flag, so for every
            // non-existing property return the activator;
            // Invariant issues: foo.bar (always) === other.baz,
            // where both `bar` and `baz` are non-existing props,
            // and `foo` and `other` are different objects
            if (typeof meta.noSuchMethod == "function") {
              activator.__noSuchMethod = meta.noSuchMethod;
              activator.__property = name;
              return activator;
            }
          }
          return getHook.call(handler, r, name);
        };
      }

      // a proxied object
      return Proxy.create(handler, proto);
    }
  });

})();

// tests
var foo = Object.new({
  // normal object level
  data: {
    x: {
      value: 10,
      writable: true
    }
  },
  // meta-level
  meta: {
    noSuchProperty: function fooNoSuchProperty(name) {
      console.log("noSuchProperty: " + name);
    },
    noSuchMethod: function fooNoSuchMethod(name, args) {
      console.log("noSuchMethod: " + name + ", args: " + args);
    }
  },
  // a prototype of an object
  proto: Object.prototype
});

foo.bar; // noSuchProperty "bar"
foo.bar(1, 2, 3); // noSuchProperty: "bar" -> noSuchMethod: "bar", args: 1, 2, 3

// normal-level doesn't disturb meta-level
foo.noSuchProperty = 10; // assign to normal-level, but not to meta-level
// still noSuchProperty of the meta-level is called
foo.baz; // noSuchProperty: "baz"

// the same with noSuchMethod
foo.noSuchMethod = 20; // assign to normal-level, but not to meta-level
// still the meta-level noSuchMethod is activated
foo.baz(10, 20, 30); // noSuchMethod: "baz", args: 10, 20, 30