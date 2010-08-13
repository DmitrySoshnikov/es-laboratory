/**
 * Common library
 *
 * @author Dmitry A. Soshnikov <dmitry.soshnikov@gmail.com>
 * (C) 2010 Mit Style License
 */

/**
 * Simply extends an object
 * with another object, but only for
 * absent properties of the object
 */
Object.defineProperty(Object, "extend", {
  value: function (self, another) {
    Object.getOwnPropertyNames(another).forEach(function (name) {
      if (Object.prototype.hasOwnProperty.call(self, name)) {
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