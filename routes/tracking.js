const express = require('express');
const router = express.Router();
const { getDB } = require('../mongo-config');

const collectionName = 'AffiliateUrlsN';

// ✅ Get all URLs
// ✅ Get all URLs
router.get('/tracking-urls', async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      console.error("DB not initialized!");
      return res.status(500).json({ message: 'Database not connected' });
    }

    const urls = await db.collection(collectionName).find().toArray();
    res.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error.message);
    res.status(500).json({ message: 'Error fetching tracking URLs' });
  }
});

// ✅ Add or update URL
router.post('/add-url', async (req, res) => {
  const { hostname, affiliateUrl, status } = req.body;

  try {
    const db = getDB();
    const existing = await db.collection(collectionName).findOne({ hostname });

    if (existing) {
      await db.collection(collectionName).updateOne(
        { hostname },
        { $set: { affiliateUrl, status: status || existing.status || "active" } }
      );
    } else {
      await db.collection(collectionName).insertOne({
        hostname,
        affiliateUrl,
        status: status || "active", // default active
      });
    }

    res.json({ message: 'URL added/updated successfully' });
  } catch (error) {
    console.error('Error adding URL:', error);
    res.status(500).json({ message: 'Error adding/updating URL', error });
  }
});

// ✅ Edit hostname / URL / Status
router.post('/edit-url', async (req, res) => {
  const { hostname, newUrl, newStatus } = req.body;

  try {
    const db = getDB();
    const existing = await db.collection(collectionName).findOne({ hostname });

    if (!existing) {
      return res.status(404).json({ message: 'Hostname not found' });
    }

    // check if no changes
    if (existing.affiliateUrl === newUrl && existing.status === newStatus) {
      return res.status(400).json({ message: 'No changes made' });
    }

    await db.collection(collectionName).updateOne(
      { hostname },
      { $set: { affiliateUrl: newUrl, status: newStatus || existing.status || "active" } }
    );

    res.json({ message: 'URL updated successfully' });
  } catch (error) {
    console.error('Error updating URL:', error);
    res.status(500).json({ message: 'Error updating URL', error });
  }
});

// ✅ Delete by hostname
router.delete('/delete-url/:hostname', async (req, res) => {
  const { hostname } = req.params;

  try {
    const db = getDB();
    const result = await db.collection(collectionName).deleteOne({ hostname });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Hostname not found' });
    }

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ message: 'Error deleting URL', error });
  }
});

// ✅ Toggle Status Active/Inactive
// ✅ Toggle Status Active/Inactive
router.post('/toggle-status', async (req, res) => {
  const { hostname, newStatus } = req.body;
  try {
    const db = getDB();
    if (!db) return res.status(500).json({ message: "Database not connected" });

    const url = await db.collection(collectionName).findOne({ hostname });
    if (!url) return res.status(404).json({ message: "Hostname not found" });

    await db.collection(collectionName).updateOne(
      { hostname },
      { $set: { status: newStatus } }
    );

    res.json({ message: `Status updated to ${newStatus}`, status: newStatus });
  } catch (error) {
    console.error("Error toggling status:", error.message);
    res.status(500).json({ message: "Error toggling status" });
  }
});

module.exports = router;