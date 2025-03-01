import { NavigationContainer } from "@react-navigation/native";
import Navigator from "@/navigators";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoginProvider } from "@/context/LoginContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <LoginProvider>
        <NavigationContainer>
          <Navigator />
        </NavigationContainer>
      </LoginProvider>
    </SafeAreaProvider>
  );
}
