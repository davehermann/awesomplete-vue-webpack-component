<template>
    <span :class="cssClasses" class="avwc-container">
        <input
            ref="searchTermEntry"
            v-model="autocompleteText"
            :placeholder="placeholderDisplayed"
            :class="inputCssClass"
            class="avwc-entry"
            />
        <button
            v-if="dropdown"
            ref="dropDownButton"
            :class="dropDownCssClass"
            type="button"
            class="avwc-dropdown"
            >
            <slot name="dropdown">&#x25BE;</slot>
        </button>
    </span>
</template>

<script>
    import awesomplete from "awesomplete";
    import "awesomplete/awesomplete.css";

    export default {
        props: {
            // AVWC options
            clearOnClose: { type: Boolean, required: false, default: undefined },   // Clear the input when the Awesomplete popup closes
            cssClass: { type: String, required: false, default: undefined },        // String value with CSS class(es) to apply to component root
            dropdown: { type: Boolean, required: false, default: undefined },       // Style and react as a drop-down combo box
            dropDownCssClass: { type: String, required: false, default: undefined },     // String value with CSS class(es) to apply to drop-down button
            // fillList MUST return a promise with an availableOptions array (see below)
            fillList: { type: [Function, Array, String], required: true, default: undefined },       // Promise that returns data source for awesomplete
            initialText: { type: String, required: false, default: undefined },     // Text to initially fill the text input box with
            inputCssClass: { type: String, required: false, default: undefined },   // String value with CSS class(es) to apply to input element
            // Default typing throttle before calling fillList
            msThrottle: { type: Number, required: false, default: 200 },            // Typing throttle in milliseconds before fillList is called
            placeholder: { type: [Boolean, String], required: false, default: undefined },          // Placeholder to show in the input field
            replaceSelectionWith: { type: String, required: false, default: undefined },          // Built-in function for replacing a selection with the text of an option instead of value
            striped: { type: Boolean, required: false, default: undefined },        // Applies a default striping class to every other item in the displayed list

            // Awesomplete options
            autoFirst: { type: Boolean, required: false, default: undefined },
            // Default maximum items to show in Awesomplete list (matches Awesomplete default)
            maxItems: { type: Number, required: false, default: 10 },
            // Default minimum length of search term (matches Awesomplete default)
            minChars: { type: Number, required: false, default: 2 },

            // Awesomplete replaceable functions
            container: { type: Function, required: false, default: undefined },
            filter: { type: Function, required: false, default: undefined },
            item: { type: Function, required: false, default: undefined },
            replace: { type: Function, required: false, default: undefined },
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

                // Flag to track whether we're setting the text in the component, and not to evaluate through Awesomplete
                textSetInternally: false,
            };
        },

        computed: {
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

            // Use either the default minimum search length or the passed in prop value
            minimumSearchLength () {
                return this.dropdown ? 0 : this.minChars;
            },

            // Display a placeholder in the search term input, with replaceable tokens for minimumSearchLength
            placeholderDisplayed () {
                // Never display if placeholder is false
                if (this.placeholder !== false) {
                    // Set the default
                    let placeholderText = "Enter at least {minChars} to search";

                    // Use a string placeholder instead of the default
                    if ((this.placeholder !== undefined) && (typeof this.placeholder == "string"))
                        placeholderText = this.placeholder;

                    // if the passed-in placeholder is true or a string, display placeholder text
                    if ((this.placeholder !== undefined) || (this.minimumSearchLength > 0))
                        return placeholderText.replace(/{minChars}/i, this.minimumSearchLength + " character" + (this.minimumSearchLength == 1 ? "" : "s"));
                }

                return null;
            },

            // Replace the text element with specific text data after a selection has been made
            replaceSelection () {
                // Warn if both clearOnClose and replaceSelectionWith are set
                if ((this.clearOnClose !== undefined) && (this.clearOnClose !== false) && (this.replaceSelectionWith !== undefined))
                    // eslint-disable-next-line no-console
                    console.error("awesomplete-vue-webpack-component Warning: 'clear-on-close' and 'replace-selection-with' are both set; 'clear-on-close' takes precedence");

                // Is nothing if a replace() function has been passed in
                if (!!this.replace)
                    return undefined;

                // Setting "clear-on-close" is identical to setting replaceSelectionWith == null
                if ((this.clearOnClose !== undefined) && (this.clearOnClose !== false))
                    return null;

                // By design, an empty string will be converted to "label" an be assumed to be the text property on a suggestion object
                if (this.replaceSelectionWith === "")
                    return "label";

                // Any other case, return the passed in prop (or the default value)
                return this.replaceSelectionWith;
            },
        },

        watch: {
            // Watch for any changes to the search term input
            autocompleteText (val) {
                // Do not trigger if the text was set via internal code
                if (this.textSetInternally)
                    this.textSetInternally = false;
                // Call the throttle trigger if the minimum search term length is met
                else if (!!val && (val.length >= this.minimumSearchLength))
                    this.TriggerAutocomplete();
            },

            // Initialization text available after mount
            initialText (val) {
                // Ignore if any value has been entered into the text input
                if (!!val && (this.autocompleteText === null)) {
                    this.textSetInternally = true;
                    this.autocompleteText = val;
                }
            },
        },

        mounted: function() {
            // Activate Awesomplete at mout
            this.ActivateAutocomplete();
        },

        methods: {
            // Autocomplete initialization
            ActivateAutocomplete () {
                // Initialization text available at mount
                if (!!this.initialText)
                    this.autocompleteText = this.initialText;

                // Get the input object
                let inputSearchTerm = this.$refs.searchTermEntry;

                // Set Awesomplete initialization options based on passed props or defaults
                let initializationOptions = {
                    autoFirst: this.autoFirst,
                    minChars: this.minimumSearchLength,
                    maxItems: this.maxItems,
                    sort: this.sort,
                };
                if (!!this.container)
                    initializationOptions.container = this.container;
                if (!!this.filter)
                    initializationOptions.filter = this.filter;
                if (!!this.item)
                    initializationOptions.item = this.item;
                if (!!this.replace)
                    initializationOptions.replace = this.replace;

                // Initialize Awesomplete object
                this.awesompleteObject = new awesomplete(inputSearchTerm, initializationOptions);

                // Emit all Awesomplete events via the VueJS event emitter
                inputSearchTerm.addEventListener("awesomplete-close", (evt) => { this.$emit("close", evt); });
                inputSearchTerm.addEventListener("awesomplete-highlight", (evt) => { this.$emit("highlight", evt); });
                inputSearchTerm.addEventListener("awesomplete-open", () => { this.$emit("open"); });
                inputSearchTerm.addEventListener("awesomplete-select", (evt) => { this.$emit("select", evt); });
                inputSearchTerm.addEventListener("awesomplete-selectcomplete", (evt) => {
                    this.$emit("selectcomplete", evt);

                    // Set the text input value to a desired value after selection if it's null (clear it) or if the value is a property on the text object
                    // Any other case will be handled by the default, or a passed in, replace()
                    if ((this.replaceSelection === null) || ((typeof this.replaceSelection === "string") && (this.replaceSelection.length > 0) && !!evt.text[this.replaceSelection])) {
                        this.textSetInternally = true;

                        this.autocompleteText = (this.replaceSelection === null) ? null : evt.text[this.replaceSelection];
                    }
                });

                // Wire the drop-down behavior to the button
                if (this.dropdown)
                    this.WireDropDown();

                // Emit the initialized Awesomplete object for direct manipulation
                this.$emit("awesomplete-object", this.awesompleteObject);

                // Emit the reference to the input element and drop-down button
                this.$emit("ref-input", this.$refs.searchTermEntry);
                this.$emit("ref-dropdown-button", this.$refs.dropDownButton);
            },

            // Refresh source data
            RefreshAutocomplete (viaDropdown) {
                // Only refresh if the source data method is not already running and if the minimum search term length is met
                if (!this.autocompleteRunning && viaDropdown || (!!this.autocompleteText && (this.autocompleteText.length >= this.minimumSearchLength))) {
                    // Flag that the source data method is being called
                    this.autocompleteRunning = true;

                    // Call the source data method (fillList Promise) passing in the search term
                    let dataFill = Promise.resolve();

                    if (this.fillList instanceof Function)
                        dataFill = this.fillList(this.autocompleteText);
                    else if (this.fillList instanceof Array)
                        dataFill = Promise.resolve(this.fillList);
                    else if (typeof this.fillList === "string")
                        dataFill = Promise.resolve(this.fillList.split(","));
                    else
                        dataFill = dataFill.then(() => Promise.reject("awesomplete-vue-webpack-component: No list-filling function defined"));

                    // return this.fillList(this.autocompleteText)
                    return dataFill
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
                this.autocompleteFillWait = setTimeout(() => { this.RefreshAutocomplete(); }, this.msThrottle);
            },

            WireDropDown () {
                let buttonDropDown = this.$refs.dropDownButton;

                buttonDropDown.addEventListener("click", (evt) => {
                    if (this.awesompleteObject.ul.childNodes.length === 0) {
                        this.awesompleteObject.minChars = 0;

                        this.RefreshAutocomplete(true)
                            .then(() => { this.awesompleteObject.minChars = this.minimumSearchLength; });
                    } else if (this.awesompleteObject.ul.hasAttribute("hidden"))
                        this.awesompleteObject.open();
                    else
                        this.awesompleteObject.close();
                });
            },
        },
    };
</script>

<style scoped>
    .striped >>> .awesomplete > ul > li:nth-child(even) { background-color: hsla(200, 10%, 80%, .7); }
    .striped >>> .awesomplete > ul > li:nth-child(even):hover { background-color: hsl(200, 40%, 80%); }
</style>
