/**
 * Test for new style ES objects
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

// require "src/lib.js"
// require "src/es6.js"
// require "src/mixin.js"

// a mixin module
var m = Object.new({
  foo: function () {
    console.log('m.foo', this === o);
  },
  baz: function () {
    console.log('m.baz', this === o);
  }
});

var o = Object.mixin(m, Object.new());

o.foo(); // "m.foo", true
console.log(o.foo === m.foo); // true, delegation is used

// another mixin
var m2 = Object.new({
  foo: function () {
    console.log('m2.foo', this === o);
  },
  bar: function () {
    console.log('m2.bar', this === o);
  }
});

// mixin it too; a warning is
// shown since we are in traitsMode
Object.mixin(m2, o);

o.foo(); // shadows "m", now "m2.foo", true
o.bar(); // "m2.bar", true
o.baz(); // "m.baz", true, from previous module "m"

// third mixin module
var m3 = Object.new({
  test: function () {
    console.log('m3.test', this === o, this === m2);
  }
});

// mixin it to another module
m2 = Object.mixin(m3, m2);

o.test(); // "m3.test", true, false
m2.test(); // "m3.test", false, true

console.log("test" in o); // true

delete m2.foo; // remove shadowing "foo"
o.foo(); // again is taken from "m", "m.foo"

// check naming conflicts detection
var m4 = {
  foo: function () {
    console.log('m4.foo', this === o);
  }
};

// turn off traitsMode
Object.mixin.traitsMode = false;

// add this trait to "o";
// no warning is shown since
// we have "traitsMode" turned off
Object.mixin(m4, o); // warning is shown

// but the method is added
// though, naming shadowing detection
// may throw exceptions
o.foo(); // "m4.foo", true