/**
 * ES6 (aka Harmony) shims
 *
 * @author Dmitry A. Soshnikov <dmitry.soshnikov@gmail.com>
 * (C) 2010 Mit Style License
 */

/**
 * ES6 isPrimitive
 */
Object.defineProperty(Object, "isPrimitive", {
  value: function (object) {
    return object !== Object(object);
  }
});

/**
* ES6 isObject
*/
Object.defineProperty(Object, "isObject", {
  value: function (object) {
    return !Object.isPrimitive(object);
  }
});

/**
 * ES6 getOwnProperties
 */
Object.getOwnProperties ||
Object.defineProperty(Object, "getOwnProperties", {
  value: function objectGetOwnProperties(object) {
    var properties = {};
    Object.getOwnPropertyNames(object).forEach(function (propertyName) {
      properties[propertyName] = Object.getOwnPropertyDescriptor(object, propertyName);
    });
    return properties;
  }
});

/**
 * ES6 getPropertyDescriptor
 */
Object.getPropertyDescriptor ||
Object.defineProperty(Object, "getPropertyDescriptor", {
  value: function (object, name) {
    do {
      var desc = Object.getOwnPropertyDescriptor(object, name);
      if (desc) {
        return desc;
      }
      object = Object.getPrototypeOf(object);
    } while (object);
  }
});

/**
 * ES6 getPropertyNames
 */
Object.getPropertyNames ||
Object.defineProperty(Object, "getPropertyNames", {
  value: function (object) {
    var propertyNames = [];
    do {
      Object.getOwnPropertyNames(object).forEach(function (property) {
        // leaky linear implementation,
        // TODO: optimize to O(1) somehow
        if (propertyNames.indexOf(property) == -1) {
          propertyNames.push(property);
        }
      });
      object = Object.getPrototypeOf(object);
    } while (object);
    return propertyNames;
  }
});

/** A no-op forwarding proxy handler
 * see: http://wiki.ecmascript.org/doku.php?id=harmony:proxies#examplea_no-op_forwarding_proxy
 * It's good to have it as a built-in sugar
 */
Object.defineProperty(Proxy, "noopHandler", {
  value: function noopHandler(obj) {
    return {
      getOwnPropertyDescriptor: function(name) {
        var desc = Object.getOwnPropertyDescriptor(obj, name);
        // a trapping proxy's properties must always be configurable
        desc.configurable = true;
        return desc;
      },
      getPropertyDescriptor:  function(name) {
        var desc = Object.getPropertyDescriptor(obj, name); // not in ES5
        // a trapping proxy's properties must always be configurable
        desc.configurable = true;
        return desc;
      },
      getOwnPropertyNames: function() {
        return Object.getOwnPropertyNames(obj);
      },
      getPropertyNames: function() {
        return Object.getPropertyNames(obj);                // not in ES5
      },
      defineProperty: function(name, desc) {
        Object.defineProperty(obj, name, desc);
      },
      delete:       function(name) { return delete obj[name]; },
      fix:          function() {
        if (Object.isFrozen(obj)) {
          return Object.getOwnPropertyNames(obj).map(function(name) {
            return Object.getOwnPropertyDescriptor(obj, name);
          });
        }
        // As long as obj is not frozen, the proxy won't allow itself to be fixed
        return undefined; // will cause a TypeError to be thrown
      },
      has:          function(name) { return name in obj; },
      hasOwn:       function(name) { return ({}).hasOwnProperty.call(obj, name); },
      get:          function(receiver, name) { return obj[name]; },
      // bad behavior when set fails in non-strict mode
      set:          function(receiver, name, val) { obj[name] = val; return true; },
      enumerate:    function() {
        var result = [];
        for (name in obj) { result.push(name); };
        return result;
      },
      keys: function() { return Object.keys(obj); }
    };
  }
});