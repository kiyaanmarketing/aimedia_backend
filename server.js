const express = require("express");
require("dotenv").config();
const corsMiddleware = require("./middleware/corsMiddleware");
const path = require("path");
const geoip = require("geoip-lite");
const app = express();
app.use(corsMiddleware);
app.use(express.json());
//const trackingRoutes = require('./routes/tracking');
//const trackingRoutesNew = require('./routes/track');
const {  connectDB, getDB, nextMidnightIST } = require('./mongo-config');
const { getAffiliateUrlByHostNameFindActive } = require("./utils/affiliateResolver");
//const { canTrackToday } = require("./utils/dailyLimit");

const port = process.env.PORT || 1225;


function injectUniqueId(affiliateUrl, uniqueId) {
  const encoded = encodeURIComponent(uniqueId);
  return affiliateUrl
    .replace(/\{replace_it\}/gi, encoded)       // {replace_it}
    .replace(/%7Breplace_it%7D/gi, encoded)     // %7Breplace_it%7D (URL encoded braces)
    .replace(/\{\d+\}/g, encoded);              // {1}, {21}, {123} etc.
}

function getCurrentDateTime() {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "Asia/Kolkata",
  };

  const dateTime = new Date().toLocaleDateString("en-IN", options);
  return dateTime;
}

const currentDateTime = getCurrentDateTime();

const getAllHostName = async (collectionName) => {
  const db = getDB();
  
  try {
    return await db.collection(collectionName).find({}).toArray();
  } catch (err) {
    console.error('MongoDB Error:', err);
    return [];
  }
};
 

// const getAffiliateUrlByHostNameFindActive = async (hostname, collectionName) => {
//   const db = getDB();
  
//   try {
//     const result = await db.collection(collectionName)
//                           .findOne({ 
//                             hostname: hostname, 
//                             status: "active"  // <-- only active hosts
//                           });
//     return result ? result.affiliateUrl : '';
//   } catch (error) {
//     console.error('MongoDB Error:', error);
//     return '';
//   }
// };


const getAffiliateUrlByHostNameFind = async (hostname, collectionName) => {
  const db = getDB();
  
  try {
    const result = await db.collection(collectionName)
                          .findOne({ hostname: hostname });
    return result ? result.affiliateUrl : 'https://api.aimedialinks.com';
  } catch (error) {
    console.error('MongoDB Error:', error);
    return '';
  }
};


async function canTrackToday(hostname, limit = 1000) {
  console.log("➡️ canTrackToday CALLED with:", hostname);

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

  const result = await db.collection("dailyClickLimits").findOneAndUpdate(
    { hostname, date: today },
    {
      $inc: { count: 1 },
      $setOnInsert: { hostname, date: today }
    },
    { upsert: true, returnDocument: "after" }
  );
console.log("➡️ Current result:", result);

  const count = result?.count;

  console.log("➡️ Current count:", count);

  return count <= limit;
}


// ===============================
// 🔥 Dynamic GET API (single route)
// ===============================
app.get('/api/get', async (req, res) => {
  try {
    const { collection } = req.query;

    // Validate collection name
    if (!collection) {
      return res.status(400).json({ success: false, error: "collection query required" });
    }

    // Allowed collections (SECURITY)
    const allowedCollections = [
      "Payloads",
      "theviewpalm",
      "fareastflora",
      "xcite",
      "myatulya",
      "wonderchef"
    ];

    if (!allowedCollections.includes(collection)) {
      return res.status(400).json({ success: false, error: "Invalid collection name" });
    }

    const db = getDB();
    const payloadCollection = db.collection(collection);

    // Fetch all data – sorted by latest
    const data = await payloadCollection.find({})
      .sort({ timestamp: -1 })
      .toArray();

    res.json({ success: true, collection, count: data.length, data });

  } catch (error) {
    console.error("Dynamic GET Error:", error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


app.post("/api/track-users", async (req, res) => {
  const { url, referrer, unique_id, origin, payload } = req.body;
  console.log("line => 12. ")
  if (!origin || !unique_id) {
    return res.status(400).json({ success: false, reason: "line 29" });
  }

  try {
    // 🔒 DAILY LIMIT CHECK
    console.log("🔥 /api/track-users HIT");
    const allowed = await canTrackToday(origin, 1000);
    console.log("line =136 => ", allowed)
    //const allowed = false;
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
        expireAt: nextMidnightIST(),
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


// Endpoint to track users and return the affiliate URL
app.post('/api/multirack-user', async (req, res) => {
  const { url, referrer, unique_id, origin } = req.body;
  //const { url, unique_id } = req.body;

  if (!url || !unique_id) {
      return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  try {
   
    const allAffiliateUrl = await getAllHostName('MuiltiRetag');
   
    const affiliateUrl = allAffiliateUrl.map(item => item.affiliateUrl);
    //const affiliateUrl = await getAllHostName('HostName').map(item => item.affiliateUrl);
    
    console.log("Affiliate URL:", affiliateUrl);

    if (!affiliateUrl) {
        return res.json({ success: true, affiliate_url: "vijjuRockNew354" }); // No matching URL
    }

    res.json({ success: true, affiliate_url: affiliateUrl });
} catch (error) {
    console.error("Error in API:", error);
    res.status(500).json({ success: false, error: 'Internal server error' });
}
});



app.post('/api/track-user', async (req, res) => {
  const { url, referrer, unique_id, origin } = req.body;

  if (!url || !unique_id) {
    return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  try {
    const affiliateUrl = await getAffiliateUrlByHostNameFindActive(origin, 'AffiliateUrlsN');

    if (!affiliateUrl) {
      return res.json({ success: true, affiliate_url: "" });
    }

    const finalUrl = injectUniqueId(affiliateUrl, unique_id);

    const db = getDB();

    // Dedup: same unique_id + url within 10 seconds = duplicate, skip insert
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const existing = await db.collection('click_logs').findOne({
      unique_id,
      url,
      timestamp: { $gte: tenSecondsAgo }
    });
    if (existing) {
      return res.json({ success: true, affiliate_url: finalUrl });
    }

    // Country from IP
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';
    const geo = geoip.lookup(ip);
    const country = geo?.country || 'Unknown';
    const city = geo?.city || '';

    await db.collection('click_logs').insertOne({
      timestamp: new Date(),
      expireAt: nextMidnightIST(),
      origin,
      url,
      referrer,
      unique_id,
      affiliate_url: finalUrl,
      country,
      city,
      ip
    });

    res.json({ success: true, affiliate_url: finalUrl });
  } catch (error) {
    console.error("Error in API:", error.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


app.post('/api/track-user-withoutUni', async (req, res) => {
  const { url, referrer, unique_id, origin } = req.body;

  // Log the incoming data
  console.log("Request Data:", req.body);

  if (!url || !unique_id) {
      return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  try {
     

      //const affiliateUrl = trackingUrls[sanitizedOrigin] || "vijjuRockNew";
      const affiliateUrl = await getAffiliateUrlByHostNameFind(origin,'AffiliateUrls');
      console.log("Affiliate URL:", affiliateUrl);

      if (!affiliateUrl) {
          return res.json({ success: true, affiliate_url: "vijjuRockNew354" }); // No matching URL
      }

      res.json({ success: true, affiliate_url: affiliateUrl });
  } catch (error) {
      console.error("Error in API:", error);
      res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/track-user-withData', async (req, res) => {
  const { url, referrer, unique_id, origin, payload } = req.body;

  console.log("Request Data:", req.body);

  if (!url || !unique_id) {
    return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  try {
    const db = getDB();

// =============================
    // 2️⃣ Store for www.xcite.com
    // =============================
    // if ((origin.includes("www.xcite.com")) && payload) {
    //   const payloadCollection = db.collection('xcite');

    //   await payloadCollection.insertOne({
    //     timestamp: new Date(),
    //     origin,
    //     payload,
    //     unique_id,
    //     url,
    //     referrer,
    //   });

    //   console.log(`✅ Stored xcite payload`);
    // }

// =============================
    // 2️⃣ Store for myatulya.com
    // =============================
    // if ((origin.includes("myatulya.com")) && payload) {
    //   const payloadCollection = db.collection('myatulya');

    //   await payloadCollection.insertOne({
    //     timestamp: new Date(),
    //     origin,
    //     payload,
    //     unique_id,
    //     url,
    //     referrer,
    //   });

    //   console.log(`✅ Stored myatulya payload`);
    // }


// =============================
    // 2️⃣ Store for www.wonderchef.com
    // =============================
    // if ((origin.includes("www.wonderchef.com")) && payload) {
    //   const payloadCollection = db.collection('wonderchef');

    //   await payloadCollection.insertOne({
    //     timestamp: new Date(),
    //     origin,
    //     payload,
    //     unique_id,
    //     url,
    //     referrer,
    //   });

    //   console.log(`✅ Stored wonderchef payload`);
    // }



    
    // =============================
    // 3️⃣ Send Affiliate URL
    // =============================
    const affiliateUrl = await getAffiliateUrlByHostNameFindActive(origin, 'AffiliateUrlsN');
    console.log("Affiliate URL:", affiliateUrl);

    if (!affiliateUrl) {
      return res.json({ success: true, affiliate_url: "vijjuRockNew354" });
    }

    res.json({ success: true, affiliate_url: affiliateUrl });

  } catch (error) {
    console.error("Error in API:", error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});




app.post('/api/track-data', async (req, res) => {
  const { origin,pid, referrer,url, ua,t } = req.body;

  // Log the incoming data
  console.log("Request Data:", req.body);

  if (!url) {
      return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  try {
     
      const affiliateUrl = await getAffiliateUrlByHostNameFind(origin,'AffiliateUrls');
      console.log("Affiliate URL:", affiliateUrl);

      if (!affiliateUrl) {
          return res.json({ success: true, track_url: "vijjuRocker" }); // No matching URL
      }

      res.json({ success: true, track_url: affiliateUrl });
  } catch (error) {
      console.error("Error in API:", error);
      res.status(500).json({ success: false, error: 'Internal server error' });
  }
});



app.get('/api/fallback-pixel', async (req, res) => {
    try {
       
     

        // 👉 Return 1×1 transparent GIF
        const gif = Buffer.from(
            'R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
            'base64'
        );

        res.set('Content-Type', 'image/gif');
        res.set('Content-Length', gif.length);
        return res.status(200).send(gif);

    } catch (error) {
        console.error("Fallback pixel error:", error);

        // Even on error, return 204 to avoid breaking script
        return res.status(204).send();
    }
});



// click_logs is a MongoDB collection shared with other backends (e.g.
// discountshop) on the same cluster — restrict this dashboard to
// aimedia_backend's own sites so other projects' writes don't leak in.
const DASHBOARD_ALLOWED_ORIGINS = [
  'aimedialinks.com',
  'alokozayshop.com',
  'www.fareastflora.com',
  'www.xcite.com',
];

app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const db = getDB();
    const col = db.collection('click_logs');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const site = req.query.site || null;
    const originFilter = site
      ? { origin: site }
      : { origin: { $in: DASHBOARD_ALLOWED_ORIGINS } };
    const siteFilter = originFilter;
    const todayFilter = { ...originFilter, timestamp: { $gte: today } };

    const [totalClicks, todayClicks, bySite, byPage, byCountry, recent, allSites] = await Promise.all([
      col.countDocuments(siteFilter),
      col.countDocuments(todayFilter),
      col.aggregate([
        { $match: siteFilter },
        { $group: { _id: '$origin', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      col.aggregate([
        { $match: siteFilter },
        { $group: { _id: '$url', origin: { $first: '$origin' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]).toArray(),
      col.aggregate([
        { $match: siteFilter },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray(),
      col.find(siteFilter).sort({ timestamp: -1 }).limit(50).toArray(),
      col.distinct('origin', { origin: { $in: DASHBOARD_ALLOWED_ORIGINS } })
    ]);

    res.json({ success: true, totalClicks, todayClicks, bySite, byPage, byCountry, recent, allSites, activeSite: site });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.use(express.static(path.join(__dirname, "public")));
//app.use('/api', trackingRoutes);
//app.use('/api', trackingRoutesNew);



connectDB()
  .then(async () => {
    const allHostNames = await getAllHostName('AffiliateUrlsN');
    //console.log("All Host Names => ", allHostNames);
    const affiliateUrl = await getAffiliateUrlByHostNameFindActive("www.tracktraffics.com",'AffiliateUrlsN');
      console.log("Affiliate URL:======>>>", affiliateUrl);
      const allowed = await canTrackToday("www.tracktraffics.com", 100000);
    console.log("allowed URL:======>>>", allowed);
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
  });