/**
 * This library extends standard "Object.create" method
 * with ability to create object with specified class.
 *
 * Also it defines concept of a meta-constructor which
 * creates other construcotrs, which in turn create
 * object with specified class.
 *
 * Currently, non-standard __proto__ extension
 * is used to inject the needed prototype for arrays.
 *
 * Tested in BESEN r.122 and FF4 beta
 *
 * @author Dmitry A. Soshnikov <dmitry.soshnikov@gmail.com>
 * (C) Mit Style License
 */

(function initialize() {

  var
    global = ("globalEval", eval)("this"),
    hasOwn = Object.prototype.hasOwnProperty,
    nativeObjectCreate = Object.create;

  /**
   * An augmented "Object.create"
   */
  Object.defineProperty(Object, "create", {
    value: function objectCreate(proto, desc, kind) {
      // default case
      if (!kind) {
        return nativeObjectCreate.call(Object, proto, (desc || {}));
      }
      // others case
      var res = new global[kind];
      res.__proto__ = proto;
      return Object.defineProperties(res, desc);
    }
  });

  /**
   * Ad-hoc case with arrays
   */
  Object.defineProperty(Array, "create", {
    value: function arrayCreate(proto, desc) {
      return Object.create(proto, desc, "Array");
    }
  });

  /**
   * simply extends an object
   * with another object, but only for
   * absent properties of the object
   */
  Object.defineProperty(Object, "extend", {
    value: function (self, another) {
      Object.getOwnPropertyNames(another).forEach(function (name) {
        if (hasOwn.call(self, name)) {
          return;
        }
        Object.defineProperty(
          self,
          name,
          Object.getOwnPropertyDescriptor(another, name)
        );
      });
      return self;
    }
  });

  /**
   * A meta-constructor which creates
   * other constructor, which in turn
   * create objects with specified class
   */
  Object.defineProperty(global, "Constructor", {
    value: Object.defineProperties({}, {
      /**
       * creates a new constructor
       */
      create: {
        value: function constructorCreate(settings) {
          // prototype of a constructor;
          var prototype = Object.extend(
            // inherits from prototype of the same
            // name global constructor as settings.class
            Object.create(global[settings.class].prototype, {
              constructor: {
                enumerable: false,
                value: settings.constructor
              }
            }),
            // and is initialized with
            // the passed properties
            settings.prototype
          );

          // define it
          Object.defineProperty(
            settings.constructor,
            "prototype",
            prototype
          );

          // default case
          if (settings.class == "Object") {
            return settings.constructor;
          }

          // other cases
          var constructor = function () {
            // create an object
            var object = Object.create(
              constructor.prototype, {},
              settings.class
            );
            // and initialzie it
            settings.constructor.apply(object, arguments);
            return object;
          };

          constructor.prototype = prototype;

          return constructor;
        }
      }
    })
  });

})();
