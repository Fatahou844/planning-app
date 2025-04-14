import axios from "axios";
import React, { createContext, useContext } from "react";

const axiosContext = createContext();
const baseUrl = "http://api.zpdigital.fr/v1";
//const baseUrl = "http://localhost:4000/v1";

export function ProvideAxios({ children }) {
  const axios = useProvideAxios();
  return (
    <axiosContext.Provider value={axios}>{children}</axiosContext.Provider>
  );
}

export const useAxios = () => {
  return useContext(axiosContext);
};

function useProvideAxios() {
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  const authToken = getCookie("jwtToken");

  // Configurations par défaut pour les requêtes sans cookies (withCredentials: false)

  const post = async (url, data, withCredentials = false) => {
    try {
      return await axios.post(baseUrl + url, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: withCredentials, // Par défaut false, mais peut être défini à true si besoin
      });
    } catch (error) {
      console.log(error);
    }
  };

  const get = async (url, withCredentials = false) => {
    try {
      return await axios.get(baseUrl + url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: withCredentials, // Par défaut false, mais peut être défini à true si besoin
      });
    } catch (error) {
      console.log(error);
    }
  };

  const put = async (url, data, withCredentials = false) => {
    try {
      return await axios.put(baseUrl + url, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: withCredentials, // Par défaut false, mais peut être défini à true si besoin
      });
    } catch (error) {
      console.log(error);
    }
  };

  const deleteData = async (url, withCredentials = false) => {
    try {
      return await axios.delete(baseUrl + url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: withCredentials, // Par défaut false, mais peut être défini à true si besoin
      });
    } catch (error) {
      console.log(error);
    }
  };

  return {
    post,
    get,
    put,
    deleteData,
  };
}
