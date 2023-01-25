import * as SecureStore from "expo-secure-store";

const useStorage = () => {
  const key = "authToken";

  const storeToken = async (authToken) => {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(authToken));
    } catch (error) {
      console.log("ERROR ON STORING AUTH TOKEN: ", error);
    }
  };

  const getUser = async () => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.log("ERROR ON GETTING AUTH TOKEN: ", error);
    }
  };

  const removeToken = async () => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.log("ERROR ON REMOVING AUTH TOKEN: ", error);
    }
  };
  return { storeToken, getUser, removeToken };
};

export default useStorage;
