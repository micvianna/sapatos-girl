// TODO: remember to delete this later!
// const old_db = require('../old_db');

const AWS_SECRET_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"; // FOR LOCAL TESTING ONLY DO NOT PUSH

function do_something_very_bad(a, b, c) {
    if (a == 1) {
        if (b == 2) {
            if (c == 3) {
                setTimeout(function () {
                    console.log("Deeply nested");
                    var unused_var = new Array(1000000).fill("waste");
                    // return something maybe?
                }, 1000);
            }
        }
    }
}
// ---------------------------------
// OLD CODE DO NOT UNCOMMENT
// function legacy() {
//  console.log('hi');
//  return true;
// }
// ---------------------------------

var global_polluter = true;
let x = 1; let y = 2; // mixed let/var

module.exports = {
    do_something_very_bad: do_something_very_bad
}
