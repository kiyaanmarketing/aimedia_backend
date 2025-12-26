
const { getDB } = require("../mongo-config");



// Dummy affiliate resolver


const getAffiliateUrlByHostNameFindActive = async (hostname, collectionName) => {
  const db = getDB();
  
  try {
    const result = await db.collection(collectionName)
                          .findOne({ 
                            hostname: hostname, 
                            status: "active"  // <-- only active hosts
                          });
    return result ? result.affiliateUrl : '';
  } catch (error) {
    console.error('MongoDB Error:', error);
    return '';
  }
};

module.exports = { getAffiliateUrlByHostNameFindActive };
