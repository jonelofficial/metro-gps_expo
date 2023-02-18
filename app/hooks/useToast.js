import React from "react";
import { useDispatch } from "react-redux";
import {
  setColor,
  setMsg,
  setVisible,
} from "../redux-toolkit/counter/snackbarSlice";

const useToast = () => {
  const dispatch = useDispatch();

  const showAlert = (msg, type) => {
    dispatch(setMsg(msg));
    dispatch(setVisible(true));
    dispatch(setColor(type));
  };
  return { showAlert };
};

export default useToast;
