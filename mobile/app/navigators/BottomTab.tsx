import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home as HomeIcon, Search as SearchIcon, Sparkles, Briefcase, MessageCircle, User } from "lucide-react-native";
import Home from "@/screens/tabs/home";
import Profile from "@/screens/tabs/profile";
import WorklyticAI from "@/screens/tabs/worklyticAI";
import Workspace from "@/screens/tabs/workspace";
import Search from "@/screens/tabs/search";
import Inbox from "@/screens/tabs/inbox";
import { COLORS } from "@/constant/color";

const Tab = createBottomTabNavigator();

export default function BottomTab() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          height: 80,
          paddingHorizontal: 15,
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarShowLabel: false,
        tabBarItemStyle: {
          height: 80,
          paddingTop: 10,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const iconSize = size;
          const strokeWidth = focused ? 2.5 : 2;
          
          switch (route.name) {
            case "Home":
              return <HomeIcon size={iconSize} color={color} strokeWidth={strokeWidth} />;
            case "Search":
              return <SearchIcon size={iconSize} color={color} strokeWidth={strokeWidth} />;
            case "WorklyticAI":
              return <Sparkles size={iconSize} color={color} strokeWidth={strokeWidth} />;
            case "Workspace":
              return <Briefcase size={iconSize} color={color} strokeWidth={strokeWidth} />;
            case "inbox":
              return <MessageCircle size={iconSize} color={color} strokeWidth={strokeWidth} />;
            case "Profile":
              return <User size={iconSize} color={color} strokeWidth={strokeWidth} />;
            default:
              return <HomeIcon size={iconSize} color={color} strokeWidth={strokeWidth} />;
          }
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
