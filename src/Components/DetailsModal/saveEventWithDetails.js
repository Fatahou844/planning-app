import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../hooks/firebaseConfig"; // Votre configuration Firestore

/**
 * Fonction pour sauvegarder un événement avec ses détails.
 * @param {string} eventId - L'ID de l'événement existant.
 * @param {Array} details - Liste des détails de l'événement, chaque détail contenant un commentaire et un prix.
 */
async function saveEventWithDetails(eventId, details) {
  try {
    // Référence directe au document de l'événement avec l'ID existant
    const eventRef = doc(db, "events", eventId);

    // Boucle sur chaque détail et ajout à la sous-collection "details" de cet événement
    for (const detail of details) {
      const detailRef = doc(collection(eventRef, "details")); // Crée un nouveau document dans "details"
      await setDoc(detailRef, {
        comment: detail.comment,
        price: detail.price,
      });
    }

    console.log("Détails ajoutés avec succès à l'événement");
  } catch (error) {
    console.error("Erreur lors de l'ajout des détails à l'événement : ", error);
  }
}

export default saveEventWithDetails;
