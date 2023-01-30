import { useFonts } from "expo-font";
import {
  MD3LightTheme as DefaultTheme,
  Provider as PaperProvider,
  configureFonts,
} from "react-native-paper";
import { Provider as StoreProvider } from "react-redux";
import { store } from "./app/redux-toolkit/store";
import AppScreen from "./app/screens/AppScreen";

export default function App() {
  const [loaded] = useFonts({
    Khyay: require("./app/assets/fonts/Khyay-Regular.ttf"),
  });
  if (!loaded) {
    return null;
  }

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      main: "#f8d738",
      accent: "#eb4934",
      primary: "#f6a03d",
      secondary: "#e8673d",
      danger: "#f56565",
      warning: "#eed202",
      success: "#48bb78",
      light: "#6e6969",
      white: "#fdfdfd",
      dark: "#0c0c0c",
    },
    fonts: configureFonts({ config: { fontFamily: "Khyay", fontSize: 16 } }),
  };
  return (
    <StoreProvider store={store}>
      <PaperProvider theme={theme}>
        <AppScreen />
      </PaperProvider>
    </StoreProvider>
  );
}
