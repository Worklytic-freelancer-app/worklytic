import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "@/screens/home";
import Profile from "@/screens/profile";
import WorklyticAI from "@/screens/worklyticAI";
import MyProjects from "@/screens/myProjects";
import Projects from "@/screens/projects";
import Chat from "@/screens/chat";

const Tab = createBottomTabNavigator();

export default function BottomTab() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="WorklyticAI" component={WorklyticAI} />
      <Tab.Screen name="MyProjects" component={MyProjects} />
      <Tab.Screen name="Projects" component={Projects} />
      <Tab.Screen name="Chat" component={Chat} />
    </Tab.Navigator>
  );
}
