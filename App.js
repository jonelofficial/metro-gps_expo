import {
  MD3LightTheme as DefaultTheme,
  Provider as PaperProvider,
  configureFonts,
} from "react-native-paper";
import { Provider as StoreProvider } from "react-redux";
import { store } from "./app/redux-toolkit/store";
import AppScreen from "./app/screens/AppScreen";
// import "./app/assets/fonts/Khyay-Regular.ttf";

const fontConfig = {};

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#f6a03d",
    secondary: "#e8673d",
  },
  fonts: configureFonts({ config: fontConfig }),
};

export default function App() {
  return (
    <StoreProvider store={store}>
      <PaperProvider theme={theme}>
        <AppScreen />
      </PaperProvider>
    </StoreProvider>
  );
}
