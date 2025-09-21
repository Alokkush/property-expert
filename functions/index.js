const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Function to aggregate admin data and store in a separate collection
exports.generateAdminReport = functions.pubsub.schedule('every 30 minutes from 06:00 to 00:00').timeZone('Asia/Kolkata').onRun(async (context) => {
  try {
    console.log('Generating admin report...');
    
    // Get all properties
    const propertiesSnapshot = await admin.firestore().collection('properties').get();
    
    // Calculate statistics
    let totalProperties = 0;
    let totalPrice = 0;
    let propertyCount = 0;
    const locationCounts = {};
    const monthlyCounts = {};
    const userIds = new Set();
    let propertiesThisWeek = 0;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    propertiesSnapshot.forEach(doc => {
      const property = doc.data();
      totalProperties++;
      
      // Count users
      if (property.userId) {
        userIds.add(property.userId);
      }
      
      // Calculate average price
      if (property.price && !isNaN(property.price)) {
        totalPrice += property.price;
        propertyCount++;
      }
      
      // Count locations
      const location = property.location || 'Unknown';
      if (locationCounts[location]) {
        locationCounts[location]++;
      } else {
        locationCounts[location] = 1;
      }
      
      // Count properties by month
      if (property.createdAt) {
        let date;
        if (property.createdAt.toDate) {
          date = property.createdAt.toDate();
        } else {
          date = new Date(property.createdAt);
        }
        
        // Check if property is from this week
        if (date >= oneWeekAgo) {
          propertiesThisWeek++;
        }
        
        // Format as "Month Year" (e.g., "Jan 2023")
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (monthlyCounts[monthYear]) {
          monthlyCounts[monthYear]++;
        } else {
          monthlyCounts[monthYear] = 1;
        }
      }
    });
    
    const avgPrice = propertyCount > 0 ? Math.round(totalPrice / propertyCount) : 0;
    
    // Get recent properties (limit to 10)
    const recentPropertiesSnapshot = await admin.firestore()
      .collection('properties')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    const recentProperties = [];
    recentPropertiesSnapshot.forEach(doc => {
      const property = doc.data();
      recentProperties.push({
        id: doc.id,
        ...property
      });
    });
    
    // Prepare data for charts
    // Location data (top 10)
    const sortedLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    const topLocations = sortedLocations.map(item => ({
      location: item[0],
      count: item[1]
    }));
    
    // Time data (sorted by date)
    const sortedMonthly = Object.entries(monthlyCounts)
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA - dateB;
      });
    
    const timeData = sortedMonthly.map(item => ({
      month: item[0],
      count: item[1]
    }));
    
    // Get all users with property counts
    const userMap = new Map();
    
    propertiesSnapshot.forEach(doc => {
      const property = doc.data();
      const userId = property.userId || 'Unknown';
      
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId: userId,
          email: 'Unknown',
          propertiesCount: 0,
          joinDate: null
        });
      }
      
      // Increment properties count
      const user = userMap.get(userId);
      user.propertiesCount++;
      
      // Update join date if this property is older
      if (property.createdAt) {
        let createdAt;
        if (property.createdAt.toDate) {
          createdAt = property.createdAt.toDate();
        } else {
          createdAt = new Date(property.createdAt);
        }
        
        if (!user.joinDate || createdAt < user.joinDate) {
          user.joinDate = createdAt;
        }
      }
    });
    
    // Convert map to array and sort by properties count (descending)
    const users = Array.from(userMap.values())
      .sort((a, b) => b.propertiesCount - a.propertiesCount);
    
    // Store aggregated data in adminReports collection
    const reportData = {
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      statistics: {
        totalProperties,
        totalUsers: userIds.size,
        propertiesThisWeek,
        avgPrice
      },
      charts: {
        locations: topLocations,
        timeData: timeData
      },
      recentProperties: recentProperties,
      users: users
    };
    
    // Save to Firestore
    await admin.firestore().collection('adminReports').doc('latest').set(reportData);
    
    console.log('Admin report generated successfully');
    return null;
  } catch (error) {
    console.error('Error generating admin report:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate admin report');
  }
});

// HTTP function to manually trigger report generation
exports.generateAdminReportManual = functions.https.onRequest(async (req, res) => {
  // Check for admin authorization (in a real implementation, you would check auth headers)
  // For now, we'll allow this for testing purposes
  
  try {
    // Trigger the report generation function
    await exports.generateAdminReport.run({ params: {} });
    res.status(200).send({ success: true, message: 'Admin report generated successfully' });
  } catch (error) {
    console.error('Error generating admin report:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

// Callable function for admin dashboard to get data
exports.getAdminData = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  try {
    // Check if user is admin
    const user = await admin.auth().getUser(context.auth.uid);
    if (!isAdmin(user.email)) {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can access this data');
    }
    
    // Get latest admin report
    const reportDoc = await admin.firestore().collection('adminReports').doc('latest').get();
    
    if (!reportDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Admin report not found');
    }
    
    const reportData = reportDoc.data();
    
    return {
      success: true,
      data: reportData
    };
  } catch (error) {
    console.error('Error getting admin data:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get admin data');
  }
});

// Helper function to check if user is admin
function isAdmin(email) {
  const adminEmails = ['admin@gmail.com'];
  return adminEmails.includes(email);
}