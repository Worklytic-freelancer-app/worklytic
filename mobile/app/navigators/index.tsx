import { createStackNavigator } from "@react-navigation/stack";
import BottomTab from "./BottomTab";

const Stack = createStackNavigator();

export type RootStackParamList = {
  BottomTab: undefined;
  Settings: undefined;
  ProjectDetails: { projectId: number };
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={BottomTab} />
    </Stack.Navigator>
  );
}
