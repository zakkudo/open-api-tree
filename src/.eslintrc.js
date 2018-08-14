module.exports = {
    "extends": [
        "eslint:recommended"
    ],
    "env": {
        "es6": true,
        "browser": true,
        "jest/globals": true
    },
    "plugins": [
        "jest"
    ],
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true
        }
    },
    "rules": {
        'max-len': ["error", { "code": 100, "comments": 120 }]
    }
};
