const { getDB } = require("../mongo-config");

async function canTrackToday(hostname, limit = 1000) {
  console.log("➡️ canTrackToday called with:", hostname);

  if (!hostname) {
    console.error("❌ Hostname missing");
    return false;
  }

  const db = getDB();
  if (!db) {
    console.error("❌ DB not initialized");
    return false;
  }

  hostname = hostname.replace(/^www\./, "");

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata"
  });

  console.log("➡️ Tracking key:", hostname, today);

  let result;
  try {
    result = await db.collection("dailyClickLimits").findOneAndUpdate(
      { hostname, date: today },
      {
        $inc: { count: 1 },
        $setOnInsert: { hostname, date: today }
      },
      { upsert: true, returnDocument: "after" }
    );
  } catch (err) {
    console.error("❌ Mongo error in daily limit:", err);
    return false;
  }

  const count = result?.value?.count;

  if (typeof count !== "number") {
    console.error("❌ Invalid count result:", result);
    return false;
  }

  console.log(
    `[DAILY LIMIT] ${hostname} | ${today} | count=${count}/${limit}`
  );

  return count <= limit;
}

module.exports = { canTrackToday };
