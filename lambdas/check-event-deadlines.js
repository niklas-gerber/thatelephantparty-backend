// lambdas/check-event-deadlines.js komplett ersetzen:

const { Event } = require('../src/models');
const { Op } = require('sequelize');

exports.handler = async () => {
    // Erzwinge Manila-Zeit für den Vergleich
    process.env.TZ = 'Asia/Manila';
    const now = new Date();
    
    console.log(`[DEADLINE-CHECK] Start: ${now.toISOString()} (PH-Time: ${now.toString()})`);

    try {
        const result = await Event.update(
            { is_active: false },
            {
                where: {
                    is_active: true,
                    ticket_deadline: { 
                        [Op.lt]: now, // Kleiner als "jetzt"
                        [Op.ne]: null // Nicht null
                    }
                }
            }
        );

        const updatedCount = result[0];
        console.log(`[DEADLINE-CHECK] Success: ${updatedCount} events deactivated.`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                updatedCount,
                currentTime: now.toISOString()
            })
        };
    } catch (error) {
        console.error(`[DEADLINE-CHECK] Error:`, error);
        throw error;
    }
};