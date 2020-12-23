import { createLogger } from "./logging";

const logger = createLogger("assert");

let assertionErrorShown = false;

function initAssert() {
    /**
     * Expects a given condition to be true
     * @param {Boolean} condition
     * @param  {...String} failureMessage
     */
    // @ts-ignore
    window.assert = function (condition, ...failureMessage) {
        if (!condition) {
            logger.error("assertion failed:", ...failureMessage);
            if (!assertionErrorShown) {
                // alert("Assertion failed (the game will try to continue to run): \n\n" + failureMessage);
                assertionErrorShown = true;
            }
            throw new Error("AssertionError: " + failureMessage.join(" "));
        }
    };
}

initAssert();
