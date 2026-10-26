/** @type {import('jest').Config} */
module.exports = {
    // ESM support ke liye Node ka experimental flag use karo (package.json me "type":"module" hai)
    testEnvironment: "node",

    // transform empty — Jest ko ESM files khud transpile nahi karne dena, Node handle karta hai
    transform: {},

    // sirf __tests__ folder ke andar wale test files chalao
    testMatch: ["**/__tests__/**/*.test.js"],

    // verbose output — har test ka naam alag se dikhta hai
    verbose: true,
};
