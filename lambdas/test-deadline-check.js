const { handler } = require('./check-event-deadlines');

// Test with mock events
(async () => {
    console.log("Testing deadline check...");
    const result = await handler({});
    console.log("Test result:", result);
})();