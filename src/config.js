// Pour de
//export const BASE_URL_API = "http://localhost:4001";

// Pour prod (à décommenter en déploiement)
 export const BASE_URL_API = "https://api.zpdigital.fr";

// ── Cloudinary ────────────────────────────────────────────────
// Renseigner avec vos identifiants Cloudinary (dashboard.cloudinary.com)
export const CLOUDINARY_CLOUD_NAME =
  process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "dho7mt3p4";
export const CLOUDINARY_UPLOAD_PRESET =
  process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "mypreset";
