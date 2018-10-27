# awesomplete-vue-webpack-component
Awesomplete wrapper for Vue and webpack

*Awesomplete Vue webpack Component (AVWC)* is an Awesomplete VueJS wrapper component that assumes webpack bundling.
*AVWC* uses a Promise-based data source allowing developer flexibility for source implementation, and supports setting/overriding Awesomplete properties via VueJS component structure.
*AVWC* also has a few additional features over core Awesomplete.

## Getting Started

### Install

```npm install awesomplete-vue-webpack-component```

### Configure usage of the component with VueJS
```
import AVWC from "awesomplete-vue-webpack-component";

Vue.component("avwc", AVWC);
```

### Use in VueJS .vue SFC file

```
<template>
    <avwc :fill-list="DataSourcePromise" @selectcomplete="ItemSelected"></avwc>
</template>

<script>
    export default {
        methods: {
            DataSourcePromise(userInputText) {
                return Promise.resolve([ "Option 1", "Option 2", "Option 3" ]);
            },

            ItemSelected(awesompleteEvent) {
                console.log(awesompleteEvent.text);
            },
        },
    }
</script>
```

### Webpack configuration must include vue-, style-, and css- loaders

*AVWC* uses single-file component (.vue) design, and automatically imports the Awesomplete CSS.


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
*For webpack 4+/compatiable vue-loader, VueLoaderPlugin usage is assumed to be configured correctly*

## Supported Props

### Required

+ ```<avwc :fill-list="PromiseMethod" />```
    + **Must** return a Promise that resolves with an Awesomplete-compatible set of options

### Optional

+ ```<avwc :auto-first="true" />```
    + Awesomplete's *autoFirst* property
+ ```<avwc clear-on-close />```
    + Clear the search term automatically when the *selectcomplete* event fires
+ ```<avwc :container="OverrideContainer" />```
    + Override Awesomplete's *container* function
+ ```<avwc cssClass="class1 class2 class3" />```
    + Specify CSS classes (string value) to add to Awesomplete
+ ```<avwc :item="OverrideItem" />```
    + Override Awesomplete's *item* function
+ ```<avwc :max-items="5" />```
    + Awesomplete's *maxItems* property
        + With the above setting it to "5"
    + **Default: 10**
+ ```<avwc :min-chars="3" />```
    + A re-implementation of Awesomplete's *minChars* property
        + With the above setting it to "3"
    + The implementation ensures that the call to the data source Promise will not fire unless the minimum character length has been met
    + **Default: 2**
+ ```<avwc :ms-throttle="1000" />```
    + Implements a delay for the call to the data source Promise to ensure that it doesn't fire too frequently while a user is still entering the search term
        + With the above setting it to "1000" ms (1 second)
    + **Default: 200ms**
+ ```<avwc :sort="false" />```
    + Awesomplete's *sort* option
        + With the above turning off automatic Awesomplete sorting
+ ```<avwc striped />```
    + Add a "striped" CSS class to Awesomplete with a default striping color scheme applied

## Supported Events

All five currently existing Awesomplete events are mapped to the VueJS event emitter <u>without</u> the **awesomplete-** prefix
+ ```awesomplete-close``` >>> ```<avwc @close="closeHandler" />```
+ ```awesomplete-highlight``` >>> ```<avwc @highlight="highlightHandler" />```
+ ```awesomplete-open``` >>> ```<avwc @open="openHandler" />```
+ ```awesomplete-select``` >>> ```<avwc @select="selectHandler" />```
+ ```awesomplete-selectcomplete``` >>> ```<avwc @selectcomplete="selectcompleteHandler" />```

## Additional Events

+ ```<avwc @awesomplete-object="awesompleteObjectHandler">```
    + After Awesomplete is initialized, *AVWC* emits the Awesomplete object for direct access

## Styling
+ *AVWC* is wrapped in a ```span``` with an ```.avwc-container``` class
+ The input element has an ```.avwc-entry``` class

# License

*Awesomplete Vue webpack Component* is released under the MIT License.
See [License](./License.md) file for more details.

# Contributing

Pull requests will be considered provided they follow existing code's styling, and are well commented.
