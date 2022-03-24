const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: 'tomas-test-cloud', 
    api_key: '539718312748817', 
    api_secret: 'RyFhO3aJg_eMvXNaz1r7VD1gTvU' 
});

module.exports = cloudinary;