/**
 * Example of magic properties and methods
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

// require "src/lib.js"
// require "src/es6.js"
// require "src/hook.js"

var foo = Object.new({

  // hook for reading properties
  // is called every time
  __get__: function (name) {
    console.log('__get__ hook for "' + name + '" property is called.');
  },

  // hook for reading of only
  // absent properties
  __noSuchProperty__: function (name) {
    console.log('__noSuchProperty__ hook for non-existing property "' + name + '" is called.');
  },

  // hook for calling of
  // missing methods
  __noSuchMethod__: function (name, args) {
    console.log('__noSuchMethod__ hook for non-existing method "' + name + '" with args ' + args + ' is called.');
  },

  // hook for writing properties
  __set__: function (name, value) {
    console.log('__set__ hook for "' + name + '" property with value ' + value + ' is called.');
  },

  // hook for removing properties
  __delete__: function (name) {
    console.log('__delete__ hook for "' + name + '" property is called.');
  },

  // foo is callable;
  // it's optional, if omitted, then
  // __construct__ is called (if present)
  __call__: function () {
    var args = Array.prototype.slice.call(arguments);
    console.log('__call__ hook is called with args: ' + args);
  },

  // and also we can define separate
  // handler for the construction;
  // it's optional, if omitted, then
  // __call__ is used
  __construct__: function () {
    var args = Array.prototype.slice.call(arguments);
    console.log('__construct__ hook is called with args: ' + args);
    // standard implementation of the [[Construct]]:
    // create an object which inherits from our "prototype"
    var newObject = Object.create(foo.prototype);
    // add a new property
    newObject.z = 30;
    // then initialize it
    var initResult = foo.__call__.apply(newObject, args);
    // if __call__ returned an object, return it,
    // else return our created object
    return Object.isObject(initResult) ? initResult : newObject;
  },

  x: 10,
  bar: function () {
    return this.x;
  }

});

// since we use __construct__
// we should have a "prototype" property
// for our object
foo.prototype = (function () {
  // return standard implementation of the "prototype"
  // with non-enumerable "constructor" property
  return Object.defineProperty({}, "constructor", {
    value: foo,
    writable: true,
    configurable: true
  });
}()),

console.log(foo.x); // __get__ x, 10
console.log(foo.bar()); // __get__ bar, __get__ x, 10

foo.y = 20; // __set__ y, value 20

console.log(foo.__count__); // 3 -- x, y, bar

delete foo.x; // __delete__ x
console.log(foo.__count__); // 2 -- y, bar

console.log(foo.z); // __get__ z, __noSuchProperty__ z

// testing native SpiderMonkeys __noSuchMethod__
// 1. with nonExisting property
foo.nonExisting(1, 2, 3); // __get__, __noSuchProperty__, __noSuchMethod__

// 2. with existing property but which it's not a function
try {
  foo.y(4, 5, 6); // error: "y" is not a function! __noSuchMethod__ cannot handle it
} catch (e) {
  console.log(e); // TypeError: foo.y is not a function
}
// redefine magic __get__ via assignment
foo.__get__ = function (name) {
  console.log('New version of __get__ for "' + name + '" property.');
};

console.log(foo.y); // New version of __get__, y

// __get__ is not enumerable
for (var k in foo) {
  console.log(k); // bar, y
}

// call the object
foo(1, 2, 3); // __call__ with 1,2,3 args

// and use it as a constructor
var bar = new foo(4, 5, 6); // __construct__ with 4,5,6 args

console.log(bar.z); // 30

console.log(typeof foo); // "function"
console.log(Object.prototype.toString.call(foo)); // "[object Function]"

// remove __call__ and __construct__ traps
delete foo.__call__;
delete foo.__construct__;

// better to have it as "object" again, but we don't in the current strawmen
console.log(typeof foo); // still "function", but not "object"
console.log(Object.prototype.toString.call(foo)); // still "[object Function]", but not "[object Object]"

console.log(foo.prototype === Object.getPrototypeOf(bar)); // true