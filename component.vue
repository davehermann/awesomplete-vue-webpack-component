<template>
    <input class="awesomplete-entry" ref="awesomplete" v-model="autocompleteText" :placeholder="placeholder" />
</template>

<script>
    import awesomplete from "awesomplete";
    import "awesomplete/awesomplete.css";

    const TYPING_DELAY = 200,
        MAXIMUM_ITEMS_TO_DISPLAY = 10,
        MINIMUM_SEARCH_STRING_LENGTH = 2;

    export default {
        // fillList MUST return a promise with an availableOptions array (see below)
        props: ["autoFirst", "fillList", "maxItems", "minChars", "msThrottle", "sort", "striped"],

        data: () => {
            return {
                autocompleteFillWait: null,
                autocompleteObject: null,
                autocompleteRunning: false,
                autocompleteText: null,
            };
        },

        computed: {
            completionThrottle () {
                return this.msThrottle || TYPING_DELAY;
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

                this.autocompleteObject = new awesomplete(codeInput, {
                    autoFirst: this.autoFirst,
                    container: (inputElement) => {
                        let elContainer = document.createElement("div");
                        elContainer.className = "awesomplete" + (this.striped !== undefined ? " striped" : "");
                        inputElement.parentNode.insertBefore(elContainer, inputElement);
                        elContainer.appendChild(inputElement);

                        return elContainer;
                    },
                    minChars: this.minimumSearchLength,
                    maxItems: this.maximumDisplayItems,
                    sort: this.sort,
                });
                codeInput.addEventListener("awesomplete-select", (evt) => {
                    evt.preventDefault();

                    this.$emit("selected", evt.text.value);

                    this.autocompleteObject.close();
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

                            this.autocompleteObject.list = availableOptions;

                            this.autocompleteObject.evaluate();

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
    input.awesomplete-entry { min-width: 20em; }
</style>

<style>
    .awesomplete.striped > ul > li:nth-child(even) { background-color: hsla(200, 10%, 80%, .7); }
    .awesomplete.striped > ul > li:nth-child(even):hover { background-color: hsl(200, 40%, 80%); }
</style>
