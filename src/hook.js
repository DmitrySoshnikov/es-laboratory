/**
 * This library defines magic properties and methods
 * for objects. Generic hooks are: __get__, __set__,
 * __delete__, __count__, __call__ and __construct__.
 *
 * Used features: Harmony (ES6) proxies.
 *
 * Tested in FF4 beta.
 *
 * @author Dmitry A. Soshnikov <dmitry.soshnikov@gmail.com>
 * (C) 2010 Mit Style License
 */

/**
 * New style objects with
 * generic hooks
 * @param {Object} object
 */
Object.defineProperty(Object, "new", {
  value: function objectNew(object) {

    // proxied object
    object || (object = {});

    // helpers
    var hasOwn = Object.prototype.hasOwnProperty;

    // magic properties
    // XXX: don't know how to handle __noSuchMethod__
    // in such a generic get of a proxy
    var magics = {
      "__get__": 1, "__set__": 1, "__delete__": 1, "__noSuchMethod__": 1,
      "__noSuchProperty__": 1, "__call__": 1, "__construct__": 1
    };

    // set enumerable false for magics in initial structure
    Object.getOwnPropertyNames(object).forEach(function (name) {
      if (hasOwn.call(magics, name)) {
        return Object.defineProperty(object, name, {
          enumerable: false,
          configurable: true,
          writable: true
        });
      }
    });

    // initial properties count excluding magics
    var count = Object.getOwnPropertyNames(object).filter(function (name) {
      return !hasOwn.call(magics, name);
    }).length;

    // __count__ accessor
    Object.defineProperty(object, "__count__", {
      get: function getCount() {
        return count;
      }
    });

    // a proxy handler
    var handler = Proxy.noopHandler(object);

    /**
     * generic [[Get]]
     */
    handler.get = function (r, name) {

      // __get__ hook
      if ("__get__" in object) {
        object.__get__(name);
      }

      // if a property is not found
      if ("__noSuchProperty__" in object && !(name in object)) {
        return object.__noSuchProperty__(name);
      }

      return object[name];
    };

    // set
    handler.set = function (r, name, value) {

      // __set__ hook
      if ("__set__" in object) {
        object.__set__(name, value);
      }

      // update count if needed
      if (!hasOwn.call(object, name)) {
        // check whether there is an inherited accessor property
        // because in this case, assignment sets the inherited property
        var inheritedDesc = Object.getPropertyDescriptor(object, name);
        // if there no inherited property, or it is a data property,
        // then a new own property will be created, so increase the count
        if (!inheritedDesc || hasOwn.call(inheritedDesc, "value")) {
          count++;
        }
      }

      // if one of the magics is being defined,
      // set its enumerable attribute to false
      if (hasOwn.call(magics, name)) {
        return Object.defineProperty(object, name, {
          value: value,
          writable: true,
          configurable: true
        });
      }

      // update/create the property
      object[name] = value;
    };

    // delete
    handler.delete = function (name) {

      // __delete__ hook
      if ("__delete__" in object) {
        object.__delete__(name);
      }

      // decrease count
      count--;

      return delete object[name];
    };

    // defineProperty
    handler.defineProperty = function (name, desc) {

      // increase count if needed
      if (!hasOwn.call(object, name)) {
        count++;
      }

      // if one of the magics is being defined,
      // set its enumerable attribute to false
      if (hasOwn.call(magics, name)) {
        desc.enumerable = false;
      }

      return Object.defineProperty(object, name, desc);
    };

    // getOwnPropertyNames to filter magics
    handler.getOwnPropertyNames = function () {
      return Object.getOwnPropertyNames(object).filter(function (name) {
        return !hasOwn.call(magics, name);
      });
    };

    // if this is initially a proxied function
    if (hasOwn.call(object, "__call__") || hasOwn.call(object, "__construct__")) {
      var createFnArgs = [handler];
      object.__call__ && (createFnArgs.push(object.__call__));
      object.__construct__ && (createFnArgs.push(object.__construct__));
      return Proxy.createFunction.apply(Proxy, createFnArgs);
    }

    // else this is a simple proxied object
    return Proxy.create(
      handler,
      Object.getPrototypeOf(object)
    );

  }
});
