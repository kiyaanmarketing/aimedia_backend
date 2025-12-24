const { getDB } = require("../mongo-config");

async function canTrackToday(hostname, limit = 1000) {
  const db = getDB();
  const today = new Date().toISOString().slice(0, 10);

  const result = await db.collection("dailyClickLimits").findOneAndUpdate(
    { hostname, date: today },
    {
      $inc: { count: 1 },
      $setOnInsert: { hostname, date: today }
    },
    { upsert: true, returnDocument: "after" }
  );

  return result.value.count <= limit;
}

module.exports = { canTrackToday };
