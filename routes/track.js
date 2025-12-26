const express = require("express");
const router = express.Router();

const { getDB } = require("../mongo-config");
const { canTrackToday } = require("../utils/dailyLimit");
const { getAffiliateUrlByHostNameFindActive } = require("../utils/affiliateResolver");



router.post("/track-users", async (req, res) => {
  const { url, referrer, unique_id, origin, payload } = req.body;

  if (!origin || !unique_id) {
    return res.status(400).json({ success: false, reason: "line 29" });
  }

  try {
    // 🔒 DAILY LIMIT CHECK
    const allowed = await canTrackToday(origin, 1000);
    if (!allowed) {
      return res.json({
        success: false,
        blocked: true,
        reason: "DAILY_LIMIT_REACHED"
      });
    }

    const db = getDB();

    // optional payload storage
    if (payload) {
      await db.collection("click_logs").insertOne({
        timestamp: new Date(),
        origin,
        url,
        referrer,
        unique_id,
        payload
      });
    }

    const affiliateUrl = await getAffiliateUrlByHostNameFindActive(origin, 'AffiliateUrlsN');

    if (!affiliateUrl) {
      return res.json({ success: false,reason: "affliateUrl not found line 61" });
    }

    res.json({
      success: true,
      affiliate_url: affiliateUrl
    });

  } catch (err) {
    console.error("Tracking error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
