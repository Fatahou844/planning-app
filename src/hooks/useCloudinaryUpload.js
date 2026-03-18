import { useState } from "react";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "../config";

/**
 * Upload un fichier vers Cloudinary (upload non signé).
 * Retourne l'URL sécurisée du fichier uploadé.
 *
 * Prérequis dans config.js :
 *   CLOUDINARY_CLOUD_NAME    → ex: "mon-garage"
 *   CLOUDINARY_UPLOAD_PRESET → ex: "articles_preset" (Upload Preset non signé)
 */
export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);

  /**
   * @param {File} file
   * @param {"image" | "raw"} resourceType  "image" pour photos, "raw" pour PDF/docs
   * @returns {Promise<string>} URL Cloudinary sécurisée
   */
  const uploadFile = async (file, resourceType = "image") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    const res = await fetch(endpoint, { method: "POST", body: formData });
    if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.statusText}`);

    const data = await res.json();
    return data.secure_url;
  };

  /**
   * Upload plusieurs fichiers en parallèle.
   * @param {File[]} files
   * @param {"image" | "raw"} resourceType
   * @returns {Promise<string[]>} tableau d'URLs
   */
  const uploadFiles = async (files, resourceType = "image") => {
    setUploading(true);
    try {
      const urls = await Promise.all(
        files.map((file) => uploadFile(file, resourceType))
      );
      return urls;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFiles, uploading };
}
