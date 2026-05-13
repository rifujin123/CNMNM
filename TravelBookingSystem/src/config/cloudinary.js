// Cloudinary configuration
// NOTE: For signed upload, backend handles all Cloudinary details
// App only needs the sign endpoint

// Backend sign endpoint - your server must implement this
// Expected: POST { folder? } -> { timestamp, signature, apiKey, cloudName, folder }
export const CLOUDINARY_SIGN_ENDPOINT = "/api/accounts/cloudinary/sign/";