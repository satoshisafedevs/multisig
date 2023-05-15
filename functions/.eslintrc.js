module.exports = {
    env: {
        es6: true,
        node: true,
    },
    parserOptions: {
        ecmaVersion: 2018,
    },
    extends: ["eslint:recommended", "google"],
    rules: {
        "no-restricted-globals": ["error", "name", "length"],
        "prefer-arrow-callback": "error",
        "space-infix-ops": "error",
        "eol-last": ["error", "always"],
        "no-multiple-empty-lines": "error",
        "quotes": ["error", "double", { avoidEscape: true }],
        "indent": ["error", 4],
        "object-curly-newline": "off",
        "object-curly-spacing": ["error", "always"],
        "max-len": ["error", { code: 120 }],
        "require-jsdoc": 0,
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
    globals: {},
};
