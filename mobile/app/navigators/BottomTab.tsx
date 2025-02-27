import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Home from "@/screens/home";
import Profile from "@/screens/profile/freelancer";
import WorklyticAI from "@/screens/worklyticAI";
import Workspace from "@/screens/workspace";
import Search from "@/screens/search";
import Inbox from "@/screens/inbox";

const Tab = createBottomTabNavigator();

export default function BottomTab() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Search": // Update case
              iconName = focused ? "search" : "search-outline";
              break;
            case "WorklyticAI":
              iconName = focused ? "sparkles" : "sparkles-outline";
              break;
            case "Workspace":
              iconName = focused ? "briefcase" : "briefcase-outline";
              break;
            case "inbox":
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="WorklyticAI" component={WorklyticAI} />
      <Tab.Screen name="inbox" component={Inbox} />
      <Tab.Screen name="Workspace" component={Workspace} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
