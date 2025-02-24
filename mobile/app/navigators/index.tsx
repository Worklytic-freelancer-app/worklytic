import { createStackNavigator } from "@react-navigation/stack";
import BottomTab from "./BottomTab";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={BottomTab} />
    </Stack.Navigator>
  );
}
