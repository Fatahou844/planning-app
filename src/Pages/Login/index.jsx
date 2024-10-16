import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import Auth from "../../Components/Auth";
import { auth } from "../../hooks/firebaseConfig";

const Login = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);
  return (
    <>
      <Auth />
    </>
  );
};

export default Login;
