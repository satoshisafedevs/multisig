module.exports = {
    env: {
        es6: true,
        node: true,
        mocha: true,
    },
    parserOptions: {
        ecmaVersion: 2020,
    },
    extends: ["eslint:recommended", "google"],
    rules: {
        "no-restricted-globals": ["error", "name", "length"],
        "prefer-arrow-callback": "error",
        "space-infix-ops": "error",
        "eol-last": ["error", "always"],
        "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
        "quotes": ["error", "double", { avoidEscape: true }],
        "indent": ["error", 4],
        "object-curly-newline": "off",
        "operator-linebreak": "off",
        "object-curly-spacing": ["error", "always"],
        "max-len": ["error", { code: 120 }],
        "require-jsdoc": 0,
        "space-before-function-paren": "off",
    },
    overrides: [
        {
            files: ["**/*.spec.*"],
            env: {
                mocha: true,
            },
            rules: {},
        },
    ],
    globals: {
        expect: true,
    },
};
