const cloudinary = require('cloudinary').v2;  // Import Cloudinary SDK

// Configuration
cloudinary.config({ 
    cloud_name: 'daxhrk0dd', 
    api_key: '261781297735499', 
    api_secret: 'KDlI07p2JKY-Fnyz_kgqL0gBn6k' // Click 'View API Keys' above to copy your API secret
});

module.exports = { cloudinary };
