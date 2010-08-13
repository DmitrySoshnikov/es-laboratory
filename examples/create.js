/**
 * Tests of "Object.create" method
 * with ability to create object with specified class.
 *
 * Also tests of a meta-constructor which
 * creates other construcotrs, which in turn create
 * object with specified class.
 *
 * Tested in BESEN r.122 and FF4 beta
 *
 * @author Dmitry A. Soshnikov <dmitry.soshnikov@gmail.com>
 * (C) Mit Style License
 */

// require "src/create.js"

// there is no much convenience
// in the first level of hierarchi,
// since with the same success we could
// just create a simple array and augment
// it with own properties
var foo = Object.create(Array.prototype, {
  size: {
    get: function getSize() {
      return this.length;
    }
  }
}, "Array");

// but on the second hierarhy level
// it may be convinient to have
// "bar" as a real array with its
// overloaded [[DefineOwnProperty]]
var bar = Object.create(foo, {
  count: {
    get: function getCount() {
      return this.size;
    }
  }
}, "Array");

bar.push(1, 2, 3);

console.log(
  bar.length, // 3
  bar.size,   // 3
  bar.count   // 3
);

bar[4] = 5;

console.log(bar); // 1,2,3,,5
console.log(bar.size); // 5

bar.length = 0;

console.log(bar.count); // 0

console.log(bar instanceof Array); // true
console.log(bar.constructor === Array); // true
console.log(Array.isArray(bar)); // true

// test with ad-hoc Array.create

var baz = Array.create(bar, {
  // array elements (very inconvenient)
  0: {value: 1, writable: true, enumerable: true, configurable: true},
  1: {value: 2, writable: true, enumerable: true, configurable: true},
  2: {value: 3, writable: true, enumerable: true, configurable: true},
  // methods
  info: {
    value: function getInfo() {
      return [this.length, this.size, this.count].join(",");
    }
  }
});

console.log(baz); // 1,2,3
console.log(baz.info()); // 3,3,3
console.log(Array.isArray(baz)); // true
console.log(baz instanceof Array); // true

// create new constructor, objects of which
// inherit from Array.prototype and are real
// arrays, additionally pass prototype properties
var Foo = Constructor.create({
  // objects kind
  class: "Array",
  // an initializer
  constructor: function Foo(args) {
    this.push.apply(this, args);
  },
  // prototype properties (also may
  // be added after "Foo" is created
  prototype: {
    size: {
      get: function getSize() {
        return this.length;
      }
    }
  }
});

var foo = new Foo([1, 2, 3]);

console.log(foo.length); // 3

foo.push(4, 5, 6);

console.log(foo); // 1,2,3,4,5,6
console.log(foo.length); // 6

foo[7] = 8;
console.log(foo); // 1,2,3,4,5,6,,8

foo.length = 3;
console.log(foo); // 1,2,3

// augment the prototype
Foo.prototype.z = 10;
console.log(foo.z); // 10

// change it to the new object
Foo.prototype = {
  constructor: Foo,
  // since we don't inherit from
  // Array.prototype, reuse just
  // one method to be able apply
  // Foo constructor which uses it
  push: Array.prototype.push,
  x: 100
};

// new object
var bar = new Foo([1, 2, 3]);

console.log(bar instanceof Foo); // true
console.log(bar instanceof Array); // false, we changed prototype
console.log(Array.isArray(bar)); // but still, it's an array -- true

console.log(bar.x); // 100

bar.push(4, 5, 6);

console.log(bar.length); // 6
console.log(bar); // [object Array], use toString from new prototype
console.log(Array.prototype.join.call(bar)); // 1,2,3,4,5,6