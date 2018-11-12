<template>
    <span :class="cssClasses" class="avwc-container">
        <input ref="searchTermEntry" v-model="autocompleteText" :placeholder="placeholder" class="avwc-entry" />
    </span>
</template>

<script>
    import awesomplete from "awesomplete";
    import "awesomplete/awesomplete.css";

    // Default typing throttle before calling fillList
    const TYPING_DELAY = 200,
        // Default maximum items to show in Awesomplete list (matches Awesomplete default)
        MAXIMUM_ITEMS_TO_DISPLAY = 10,
        // Default minimum length of search term (matches Awesomplete default)
        MINIMUM_SEARCH_STRING_LENGTH = 2;

    export default {
        props: {
            // AVWC options
            clearOnClose: { type: Boolean, required: false, default: undefined },     // Clear the input when the Awesomplete popup closes
            cssClass: { type: String, required: false, default: undefined },         // String value with CSS class(es) to apply to component root
            // fillList MUST return a promise with an availableOptions array (see below)
            fillList: { type: Function, required: true, default: undefined },         // Promise that returns data source for awesomplete
            msThrottle: { type: Number, required: false, default: TYPING_DELAY },       // Typing throttle in milliseconds before fillList is called
            striped: { type: Boolean, required: false, default: undefined },          // Applies a default striping class to every other item in the displayed list

            // Awesomplete options
            autoFirst: { type: Boolean, required: false, default: undefined },
            maxItems: { type: Number, required: false, default: MAXIMUM_ITEMS_TO_DISPLAY },
            minChars: { type: Number, required: false, default: MINIMUM_SEARCH_STRING_LENGTH },

            // Awesomplete replaceable functions
            container: { type: Function, required: false, default: undefined },
            item: { type: Function, required: false, default: undefined },
            sort: { type: Function, required: false, default: undefined },
        },

        data: () => {
            return {
                // Track the throttle delay setTimeout ID
                autocompleteFillWait: null,
                // Track whether fillList has been called and is awaiting completion
                autocompleteRunning: false,
                // The search term input
                autocompleteText: null,

                // The Awesomplete object needs to be a property in the Vue instance
                awesompleteObject: null,
            };
        },

        computed: {
            // Use either the default throttle or the passed in prop value
            completionThrottle () {
                return this.msThrottle || TYPING_DELAY;
            },

            // Complete list of CSS classes to include on the root
            cssClasses () {
                let css = {
                    // Add the AVWC striping class
                    striped: ((this.striped !== undefined) && (this.striped !== false))
                };

                // Add any CSS classes passed in prop value
                if (!!this.cssClass)
                    css[this.cssClass] = true;

                return css;
            },

            // Use either the default maximum items or the passed in prop value
            maximumDisplayItems () {
                return this.maxItems || MAXIMUM_ITEMS_TO_DISPLAY;
            },

            // Use either the default minimum search length or the passed in prop value
            minimumSearchLength () {
                return this.minChars || MINIMUM_SEARCH_STRING_LENGTH;
            },

            // Display a placeholder in the search term input based on the minimum search length
            placeholder () {
                if (this.minimumSearchLength > 0)
                    return "Enter at least " + this.minimumSearchLength + " character" + (this.minimumSearchLength == 1 ? "" : "s") + " to search";

                return null;
            },
        },

        watch: {
            // Watch for any changes to the search term input
            autocompleteText (val) {
                // Call the throttle trigger if the minimum search term length is met
                if (!!val && (val.length >= this.minimumSearchLength))
                    this.TriggerAutocomplete();
            },
        },

        mounted: function() {
            // Activate Awesomplete at mout
            this.ActivateAutocomplete();
        },

        methods: {
            // Autocomplete initialization
            ActivateAutocomplete () {
                // Get the input object
                let inputSearchTerm = this.$refs.searchTermEntry;

                // Set Awesomplete initialization options based on passed props or defaults
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

                // Initialize Awesomplete object
                this.awesompleteObject = new awesomplete(inputSearchTerm, initializationOptions);

                // Emit all Awesomplete events via the VueJS event emitter
                inputSearchTerm.addEventListener("awesomplete-close", (evt) => { this.$emit("close", evt); });
                inputSearchTerm.addEventListener("awesomplete-highlight", (evt) => { this.$emit("highlight", evt); });
                inputSearchTerm.addEventListener("awesomplete-open", () => { this.$emit("open"); });
                inputSearchTerm.addEventListener("awesomplete-select", (evt) => { this.$emit("select", evt); });
                inputSearchTerm.addEventListener("awesomplete-selectcomplete", (evt) => {
                    this.$emit("selectcomplete", evt);

                    // Optionally clear the input search term after selection
                    if ((this.clearOnClose !== undefined) && (this.clearOnClose !== false))
                        this.autocompleteText = null;
                });

                // Emit the initialized Awesomplete object for direct manipulation
                this.$emit("awesomplete-object", this.awesompleteObject);
            },

            // Refresh source data
            RefreshAutocomplete () {
                // Only refresh if the source data method is not already running and if the minimum search term length is met
                if (!this.autocompleteRunning && !!this.autocompleteText && (this.autocompleteText.length >= this.minimumSearchLength)) {
                    // Flag that the source data method is being called
                    this.autocompleteRunning = true;

                    // Call the source data method (fillList Promise) passing in the search term
                    this.fillList(this.autocompleteText)
                        .then(availableOptions => {
                            // availableOptions should be either
                            //     1) acceptable values for Awesomplete's .list property
                            //     2) an empty array for no values

                            // Set the .list property to the fillList result set
                            this.awesompleteObject.list = availableOptions;

                            // Regenerate the Awesomplete UI
                            this.awesompleteObject.evaluate();

                            // Flag that the source data method is not running
                            this.autocompleteRunning = false;
                        });
                }
            },

            // Use a timeout to throttle when to run the source data method
            TriggerAutocomplete () {
                // Clear any existing timeout to reset a throttle delay
                if (!!this.autocompleteFillWait)
                    clearTimeout(this.autocompleteFillWait);

                // Call the source data method after a throttle delay, and track the timeout for clearing later
                this.autocompleteFillWait = setTimeout(() => { this.RefreshAutocomplete(); }, this.completionThrottle);
            },
        },
    };
</script>

<style scoped>
    .avwc-container >>> input { min-width: 20em; }
    .striped >>> .awesomplete > ul > li:nth-child(even) { background-color: hsla(200, 10%, 80%, .7); }
    .striped >>> .awesomplete > ul > li:nth-child(even):hover { background-color: hsl(200, 40%, 80%); }
</style>
