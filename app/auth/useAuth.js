import jwtDecode from "jwt-decode";
import React from "react";
import { useDispatch } from "react-redux";
import useDisclosure from "../hooks/useDisclosure";
import {
  addToken,
  addUser,
  removeToken,
  removeUser,
} from "../redux-toolkit/counter/userCounter";
import useStorage from "./useStorage";

const useAuth = () => {
  const { isOpen: isLoading, onToggle, onClose } = useDisclosure();
  const { storeToken } = useStorage();
  const dispatch = useDispatch();

  const login = async (values) => {
    onToggle();
    await fetch(`${process.env.BASEURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then(async (data) => {
        dispatch(addToken(data));
        dispatch(addUser(jwtDecode(data.token)));
        storeToken(data.token);
        onClose();
      })
      .catch((error) => {
        onClose();
        console.error("Error:", error);
      });
  };

  const logout = async () => {
    dispatch(removeToken());
    dispatch(removeUser());
  };

  return { logout, login, isLoading };
};

export default useAuth;
