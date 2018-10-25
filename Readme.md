# awesomplete-vue-webpack-component
Awesomplete wrapper for Vue and webpack

*AVWC* is an Awesomplete VueJS wrapper component that assumes webpack bundling.
It uses a Promise-based data source allowing developer flexibility for source implementation, and it supports setting/overriding Awesomplete properties.

## Getting Started

### Install

### Configure usage of the component with VueJS
```
import AVWC from "awesomplete-vue-webpack-component";

Vue.component("avwc", AVWC);
```

### Webpack configuration must include vue-, style-, and css- loaders
```
{
    module: {
        rules: [
            { test: /\.css$/, use: [`style-loader`, `css-loader`] },
            { test: /\.vue$/, use: `vue-loader` },
        ]
    }
}
```

### Use in VueJS template

```
<template>
    <avwc :fill-list="DataSourcePromise"></avwc>
</template>

<script>
    export default {
        methods: {
            DataSourcePromise(userInputText) {
                return Promise.resolve([ "Option 1", "Option 2", "Option 3" ]);
            }
        },
    }
</script>
```

## Supported Attributes

### Required

+ ```v-bind:fill-list```
    + **Must** return a Promise that resolves with an array of list options
        + Any awesomplete-compatible array of options can be returned

### Optional

+ ```v-bind:auto-first```
    + Awesomplete's *autoFirst* property
+ ```v-bind:max-items```
    + Awesomplete's *maxItems* property
+ ```v-bind:min-chars```
    + A re-implementation of Awesomplete's *minChars* property
    + The implementation ensures that the call to the data source Promise will not fire unless the minimum character length has been met
    + **Default: 2**
+ ```v-bind:ms-throttle```
    + Implements a delay for the call to the data source Promise to ensure that it doesn't fire too frequently while a user is still entering the search term
    + **Default: 200ms**
+ ```v-bind:sort```
    + Awesomplete's *sort*
