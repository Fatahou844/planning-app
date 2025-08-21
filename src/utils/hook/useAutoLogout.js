import Cookies from "js-cookie";
import { useEffect, useRef } from "react";

const useAutoLogout = (onLogout, timeout = 10 * 60 * 1000) => {
  const timer = useRef(null);

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      console.log("⏰ Inactivité détectée, déconnexion en cours...");
      const token = Cookies.get("jwtToken"); // si encore présent avant remove
      if (token) {
        try {
          const payloadBase64 = token.split(".")[1];
          const payload = JSON.parse(atob(payloadBase64));
          const userEmail = payload?.sub;
          if (userEmail) {
            localStorage.removeItem(`hasSeenNotification_${userEmail}`);
          }
        } catch (e) {
          console.error("Erreur décodage JWT :", e);
        }
      }
      onLogout(); // Appelle ta fonction logout
    }, timeout);
  };

  const activityEvents = [
    "mousemove",
    "mousedown",
    "keypress",
    "touchstart",
    "scroll",
  ];

  useEffect(() => {
    // Démarrer le timer au chargement
    resetTimer();

    // Réinitialiser le timer à chaque interaction utilisateur
    for (const event of activityEvents) {
      window.addEventListener(event, resetTimer);
    }

    return () => {
      // Nettoyage
      for (const event of activityEvents) {
        window.removeEventListener(event, resetTimer);
      }
      clearTimeout(timer.current);
    };
  }, []);
};

export default useAutoLogout;
