import axios from "axios";
import React, { createContext, useContext } from "react";

const axiosContext = createContext();
const BASE_URL_API = "https://api.zpdigital.fr";
const baseUrl = `${BASE_URL_API}/v1`;

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

  const configDefaullt = {
    withCredentials: true, // TRÈS IMPORTANT
    headers: {
      Authorization: `Bearer ${authToken}`, // Utilisation de Bearer pour les jetons JWT
      // Si vous utilisez un autre type d'autorisation, ajustez cette ligne en conséquence
    },
  };

  const post = async (url, data, config = configDefaullt) => {
    //  setHeader();

    try {
      return await axios.post(baseUrl + url, data, (config = configDefaullt));
    } catch (error) {
      // console.log(error);
    }
  };

  const get = async (url, config) => {
    //    setHeader();
    try {
      return await axios.get(baseUrl + url, (config = configDefaullt));
    } catch (error) {
      // console.log(error);
    }
  };

  const put = async (url, data, config) => {
    //    setHeader();
    try {
      return await axios.put(baseUrl + url, data, config);
    } catch (error) {
      // console.log(error);
    }
  };

  return {
    post,
    get,
    put,
  };
}
