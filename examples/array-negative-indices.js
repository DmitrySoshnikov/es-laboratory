/**
 * Test for Array.new which provides overloaded [[Get]] and [[Put]]
 * with handling negative indices of arrays.
 *
 * @see http://github.com/DmitrySoshnikov/es-laboratory/blob/master/src/array-negative-indices.js
 *
 * @author Dmitry A. Soshnikov <dmitry.soshnikov@gmail.com>
 *
 * (C) 2010 Mit Style License
 *
 */

load("../src/array-negative-indices.js");

var a = Array.new(1, 2, 3);

console.log(a[-1]); // 3
console.log(a[-2]); // 2

a[-1] = 10;
console.log(a); // 1,2,10
console.log(a[-1]); // 10