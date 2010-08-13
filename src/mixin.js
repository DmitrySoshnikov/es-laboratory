/**
 * This library defines a new style ES objects
 * which support delegation based mixins. A mixin
 * chain is stored in the internal [[Mixin]] property.
 *
 * Used features: Harmony (ES6) proxies.
 *
 * Tested in FF4 beta.
 *
 * @author Dmitry A. Soshnikov <dmitry.soshnikov@gmail.com>
 * (C) 2010 Mit Style License
 */

/**
 * Adds a module to a mixin
 * chain of an object
 *
 * @param {Object} module
 *   - an object being mixed
 * @param {Object} to
 *   - an object being extended by the module
 *
 * Both, "module" and "to" are new style objects with
 * internal property __mixin__. Formally, "module" may
 * be a simple object. However, it will be hard then to
 * extend the mixin itself later (it it's already been
 * mixed as a simple object before to some other object).
 *
 * In traits mode (enabled by default) checks naming
 * conflicts at early stage and warnings an issue.
 *
 */
Object.defineProperty(Object, "mixin", {
  value: function objectMixin(module, to) {

    // in traits mode check naming conflicts
    if (Object.mixin.traitsMode) {
      for (var name in module) if (name in to) {
        console.log('Warning: "' + name + '" is already in the object.');
        // throw "Naming conflict";
      }
    }

    // mixin the module to the object
    to.__mixin__.push(module);
    return to;

  }
});

/**
 * traits mode: checks whether
 * a property is already in object;
 * in this case shows a warning message
 */
Object.defineProperty(Object.mixin, "traitsMode", {
  value: true,
  writable: true
});

/**
 * New style objects with
 * internal [[Mixin]] property -
 * a chain of mixied objects
 */
Object.defineProperty(Object, "new", {
  value: function objectNew(object) {

    // proxied object
    object || (object = {});

    // chain of mixins
    Object.defineProperty(object, "__mixin__", {
      value: []
    });

    // a proxy handler
    var handler = Proxy.noopHandler(object);

    // helpers
    var hasOwn = Object.prototype.hasOwnProperty;

    /**
     * generic [[Get]] which resolves
     * a property by the chain: own ->
     * the mixin chain -> the prototype chain;
     * Every object in the mixin chain
     * has the same property resolution
     */
    handler.get = function (r, name) {

      // first check an own property;
      if (hasOwn.call(object, name)) {
        return object[name];
      }

      // then consider the mixin chain;
      var mixin = object.__mixin__;
      var k = mixin.length; while (k--) {
        // consider the prototype chain
        // as well; these objects may
        // be proxies themselves.
        // TODO: remove overhead
        if (name in mixin[k]) {
          return mixin[k][name];
        }
      }

      // if the property is not found
      // in the mixin chain, consider
      // the prototype chain
      return object[name];

    };

    /**
     * Test for in operator
     * considers both [[Prototype]]
     * and [[Mixin]] chains
     */
    handler.has = function (name) {
      if (name in object) {
        return true;
      }
      // then consider the mixin chain;
      var mixin = object.__mixin__;
      var k = mixin.length; while (k--) {
        if (name in mixin[k]) {
          return true;
        }
      }
      return false;
    };

    // a proxied object
    return Proxy.create(
      handler,
      Object.getPrototypeOf(object)
    );
  }
});
