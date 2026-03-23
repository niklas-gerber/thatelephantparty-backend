// lambdas/run-check.js
const { handler } = require('./check-event-deadlines');

(async () => {
    console.log("--- Manual Deadline Check Execution ---");
    try {
        await handler();
        console.log("Done.");
        process.exit(0); // Beendet den Node-Prozess im Container
    } catch (err) {
        console.error("Failed:", err);
        process.exit(1);
    }
})();