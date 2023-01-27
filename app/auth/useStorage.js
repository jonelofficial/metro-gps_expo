import * as SecureStore from "expo-secure-store";

const useStorage = () => {
  const key = "authToken";
  const userKey = "authUser";

  const storeToken = async (authToken) => {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(authToken));
    } catch (error) {
      console.log("ERROR ON STORING AUTH TOKEN: ", error);
    }
  };

  const storeUser = async (data) => {
    try {
      await SecureStore.setItemAsync(userKey, JSON.stringify(data));
    } catch (error) {
      console.log("ERROR ON STORING USER: ", error);
    }
  };

  const getUser = async () => {
    try {
      return await SecureStore.getItemAsync(userKey);
    } catch (error) {
      console.log("ERROR ON GETTING USER: ", error);
    }
  };

  const getToken = async () => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.log("ERROR ON GETTING  TOKEN: ", error);
    }
  };

  const removeToken = async () => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.log("ERROR ON REMOVING AUTH TOKEN: ", error);
    }
  };

  const removeUser = async () => {
    try {
      await SecureStore.deleteItemAsync(userKey);
    } catch (error) {
      console.log("ERROR ON REMOVING USER: ", error);
    }
  };
  return { storeToken, getUser, removeToken, getToken, storeUser, removeUser };
};

export default useStorage;
