import { createStackNavigator } from "@react-navigation/stack";
import BottomTab from "./BottomTab";
import ProjectDetails from "@/screens/projects/projectDetails";
import Settings from "@/screens/profile/settings";
import SignIn from "@/screens/auth/signIn";
import SignUp from "@/screens/auth/signUp";
import Search from "@/screens/search";

const Stack = createStackNavigator();

export type RootStackParamList = {
  BottomTab: undefined;
  Settings: undefined;
  ProjectDetails: { projectId: number };
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Search: undefined;
};

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="BottomTab" component={BottomTab} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetails} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Search" component={Search} />
    </Stack.Navigator>
  );
}
