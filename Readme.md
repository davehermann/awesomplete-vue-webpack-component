# awesomplete-vue-webpack-component
Awesomplete wrapper for Vue and webpack

*Awesomplete Vue webpack Component (AVWC)* is an Awesomplete VueJS wrapper component that assumes webpack bundling.
*AVWC* accepts comma-separated strings, arrays, or Promise-returning functions as its data source allowing developer flexibility for source implementation, and supports setting/overriding Awesomplete properties via VueJS component structure.
*AVWC* also has a few additional features over core Awesomplete.

## Getting Started

### Install

```npm install awesomplete-vue-webpack-component```

### Configure usage of the component with VueJS
```javascript
import AVWC from "awesomplete-vue-webpack-component";

Vue.component("avwc", AVWC);
```

### Use in VueJS .vue SFC file

```html
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


```javascript
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

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `fill-list` | <ul><li>Comma-separated **String** list</li><li>**Array**</li><li>**Function** that returns a Promise</li></ul> | Awesomplete-compatible set of options |

### Optional

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `auto-first` | Boolean | Awesomplete's *autoFirst* property |
| `clear-on-close` | Boolean | Clear the search term automatically when the *selectcomplete* event fires |
| `container` | Function | Override Awesomplete's *container* function |
| `css-class` | String | One or more CSS classes to add to the Awesomplete block |
| `dropdown` | Boolean | <ul><li>Include a dropdown button to the right of the input box</li><li>*AVWC* will wire the **fill-list** function to fire on an empty search term box (i.e. min-chars == 0)<ul><li>**An empty search case must be handled for a reasonable combobox UX**</li></ul></li><li>By default, the button content is a down arrow &#x25BE; (*&amp;#x25BE;*) character<ul><li>A [slot named "dropdown"](https://vuejs.org/v2/guide/components-slots.html#Named-Slots) can be used to override the default down arrow</li></ul></li></ul> |
| `drop-down-css-class` | String | One or more CSS classes to add to the drop-down button |
| `initial-text` | String | <ul><li>Set the initial text to display in the text input box</li><li>If the value isn't available at mount, but is set before the user enters text in the field, the value will still be displayed</li></ul> |
| `input-css-class` | String | One or more CSS classes to add to the text input element |
| `item` | Function | Override Awesomplete's *item* function |
| `max-items` | Number | <ul><li>Awesomplete's *maxItems* property</li><li>default: **10**</li></ul> |
| `min-chars` | Number | <ul><li>A re-implementation of Awesomplete's *minChars* property</li><li>The implementation ensures that a function passed to **fill-list** will not be called unless the minimum character length has been met</li><li>default: **2**</li></ul> |
| `ms-throttle` | Number | <ul><li>Adds an active-typing delay - in milliseconds - to the data source evaluation</li><li>default: **200** milliseconds</li></ul> |
| `placeholder` | <ul><li>String</li><li>Boolean</li></ul> | <ul><li>Set placeholder text for the text input element</li><li>Using the token **{minChars}** in the string will replace it with `min-chars` value + "characters"</li><li>*false*, an empty string, or leaving this unset with `min-chars` == **0** will hide the placeholder</li><li>*true* will show the default placeholder even if `min-chars` == **0**</li><li>default: **Enter at least {minChars} to search**</li></ul> |
| `sort` | <ul><li>Function</li><li>*false*</li></ul> | Awesomplete's *sort* function |
| `striped` | Boolean | Add a *.striped* CSS class to Awesomplete with a default striping color scheme applied |


## Emitted events

### Awesomplete events

All five currently existing Awesomplete events are mapped to the VueJS event emitter <u>without</u> the **awesomplete-** prefix

| Awesomplete Event | *AVWC* Emitted Event |
| ----------------- | -------------------- |
| ```awesomplete-close``` | ```close``` |
| ```awesomplete-highlight``` | ```highlight``` |
| ```awesomplete-open``` | ```open``` |
| ```awesomplete-select``` | ```select``` |
| ```awesomplete-selectcomplete``` | ```selectcomplete``` |

### Object references

*AVWC* emits objects as events after initialization

| Emitted Event | Description |
| ------------- | ----------- |
| awesomplete-object | The Awesomplete object |
| ref-input | The text input element |
| ref-dropdown-button | The dropdown button (only when `dropdown` is enabled) |

## Styling
+ *AVWC* is wrapped in a ```span``` with an ```.avwc-container``` class
+ The input element has an ```.avwc-entry``` class
+ The drop-down button has an ```.avwc-dropdown``` class

# License

*Awesomplete Vue webpack Component* is released under the MIT License.
See [License](./License.md) file for more details.

# Contributing

Pull requests will be considered provided they follow existing code's styling, and are well commented.
