const { Event } = require('../src/models');
const { sequelize } = require('../src/db');
const { Op } = require('sequelize');

/*
 * Automatically deactivates events whose ticket deadlines have passed
 * Runs on a schedule (e.g., daily via AWS Lambda)
 */
exports.handler = async () => {
    // Set timezone (works in both Lambda and local)
    process.env.TZ = 'Asia/Manila';
    
    const now = new Date();
    console.log(`Current PH Time: ${now}`);
    
    const result = await Event.update(
        { is_active: false },
        {
            where: {
                is_active: true,
                ticket_deadline: { [Op.lt]: now }
            }
        }
    );
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            updatedCount: result[0],
            currentTime: now.toISOString()
        })
    };
};