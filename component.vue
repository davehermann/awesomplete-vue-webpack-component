<template>
    <span class="avwc-container" :class="cssClasses">
        <input class="avwc-entry" ref="awesomplete" v-model="autocompleteText" :placeholder="placeholder" />
    </span>
</template>

<script>
    import awesomplete from "awesomplete";
    import "awesomplete/awesomplete.css";

    const TYPING_DELAY = 200,
        MAXIMUM_ITEMS_TO_DISPLAY = 10,
        MINIMUM_SEARCH_STRING_LENGTH = 2;

    export default {
        // fillList MUST return a promise with an availableOptions array (see below)
        props: [
            // AVWC options
            "clearOnClose",     // Clear the input when the Awesomplete popup closes
            "cssClass",         // String value with CSS class(es) to apply to component root
            "fillList",         // Promise that returns data source for awesomplete
            "msThrottle",       // Typing throttle in milliseconds before fillList is called
            "striped",          // Applies a default striping class to every other item in the displayed list

            // Awesomplete options
            "autoFirst",
            "maxItems",
            "minChars",

            // Awesomplete replaceable functions
            "container",
            "item",
            "sort",
        ],

        data: () => {
            return {
                autocompleteFillWait: null,
                autocompleteRunning: false,
                autocompleteText: null,

                // The Awesomplete object needs to be a property in the Vue instance
                awesompleteObject: null,
            };
        },

        computed: {
            completionThrottle () {
                return this.msThrottle || TYPING_DELAY;
            },

            cssClasses () {
                let css = {
                    striped: ((this.striped !== undefined) && (this.striped !== false))
                };

                if (!!this.cssClass)
                    css[this.cssClass] = true;

                return css;
            },

            maximumDisplayItems () {
                return this.maxItems || MAXIMUM_ITEMS_TO_DISPLAY;
            },

            minimumSearchLength () {
                return this.minChars || MINIMUM_SEARCH_STRING_LENGTH;
            },

            placeholder () {
                if (this.minimumSearchLength > 0)
                    return "Enter at least " + this.minimumSearchLength + " character" + (this.minimumSearchLength == 1 ? "" : "s") + " to search";

                return null;
            },
        },

        methods: {
            ActivateAutocomplete () {
                let codeInput = this.$refs.awesomplete;

                let initializationOptions = {
                    autoFirst: this.autoFirst,
                    minChars: this.minimumSearchLength,
                    maxItems: this.maximumDisplayItems,
                    sort: this.sort,
                };
                if (!!this.container)
                    initializationOptions.container = this.container;
                if (!!this.item)
                    initializationOptions.item = this.item;

                this.awesompleteObject = new awesomplete(codeInput, initializationOptions);

                codeInput.addEventListener("awesomplete-close", (evt) => { this.$emit("close", evt); });
                codeInput.addEventListener("awesomplete-highlight", (evt) => { this.$emit("highlight", evt); });
                codeInput.addEventListener("awesomplete-open", () => { this.$emit("open"); });
                codeInput.addEventListener("awesomplete-select", (evt) => { this.$emit("select", evt); });
                codeInput.addEventListener("awesomplete-selectcomplete", (evt) => {
                    this.$emit("selectcomplete", evt);

                    if ((this.clearOnClose !== undefined) && (this.clearOnClose !== false))
                        this.autocompleteText = null;
                });
            },

            RefreshAutocomplete () {
                if (!this.autocompleteRunning && !!this.autocompleteText && (this.autocompleteText.length >= this.minimumSearchLength)) {
                    this.autocompleteRunning = true;

                    this.fillList(this.autocompleteText)
                        .then(availableOptions => {
                            // availableOptions should be either
                            //     1) an object array of { label, value }
                            //     2) an empty array

                            this.awesompleteObject.list = availableOptions;

                            this.awesompleteObject.evaluate();

                            this.autocompleteRunning = false;
                        });
                }
            },

            TriggerAutocomplete () {
                if (!!this.autocompleteFillWait)
                    clearTimeout(this.autocompleteFillWait);

                this.autocompleteFillWait = setTimeout(() => { this.RefreshAutocomplete(); }, this.completionThrottle);
            },
        },

        watch: {
            autocompleteText (val) {
                if (!!val && (val.length >= this.minimumSearchLength))
                    this.TriggerAutocomplete();
            },
        },

        mounted: function() {
            this.ActivateAutocomplete();
        },
    }
</script>

<style scoped>
    .striped >>> .awesomplete > ul > li:nth-child(even) { background-color: hsla(200, 10%, 80%, .7); }
    .striped >>> .awesomplete > ul > li:nth-child(even):hover { background-color: hsl(200, 40%, 80%); }
</style>
