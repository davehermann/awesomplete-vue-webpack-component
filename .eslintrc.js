module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": ["eslint:recommended", "plugin:vue/recommended"],
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "linebreak-style": ["error", "unix"],
        "no-extra-boolean-cast": ["off"],
        "no-unused-vars": ["warn"],
        "quotes": ["error", "double"],
        "semi": ["error", "always"],
        "no-console": ["warn"],

        "vue/html-indent": ["error", 4, { "closeBracket": 1 }],
        "vue/html-self-closing": ["warn", { "html": { "void": "any", "normal": "never", "component": "never" } }],
        "vue/max-attributes-per-line": ["error", { "singleline": 4, "multiline": { "max": 1, "allowFirstLine": false } }],
        "vue/mustache-interpolation-spacing": ["warn", "never"]
    }
};
