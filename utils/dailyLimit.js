const { getDB } = require("../mongo-config");

async function canTrackToday(hostname, limit = 1000) {
  const db = getDB();
  if (!db) throw new Error("DB not initialized");

  
  // normalize hostname
  hostname = hostname.replace(/^www\./, "");

  // IST date (important)
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });

  const result = await db
    .collection("dailyClickLimits")
    .findOneAndUpdate(
      { hostname, date: today },
      {
        $inc: { count: 1 },
        $setOnInsert: { hostname, date: today }
      },
      { upsert: true, returnDocument: "after" }
    );

  if (!result.value) return false;
  console.log(
  `[DAILY LIMIT] ${hostname} | ${today} | count=${result.value.count}/${limit}`
);


  return result.value.count <= limit;
}

module.exports = { canTrackToday };
