const Activity = require("../model/activity.model");

const logActivity = async (userId, action, entityType, entityId) => {
  try {
    await Activity.create({
      userId,
      action,
      entityType,
      entityId,
    });
  
  } catch (error) {
    console.error("Error logging activity:", error);
 
  }
};

module.exports = logActivity;