import { createStackNavigator } from "@react-navigation/stack";
import BottomTab from "./BottomTab";
import ProjectDetails from "@/screens/projects/projectDetails";
import Settings from "@/screens/profile/settings";
import SignIn from "@/screens/auth/signIn";
import SignUp from "@/screens/auth/signUp";
import Search from "@/screens/search";
import DirectMessage from "@/screens/inbox/directMessage";
import Freelancers from "@/screens/profileDetails/freelancers";
import FreelancerDetails from "@/screens/profileDetails/freelancers/freelancerDetails";
import WorkspaceDetails from "@/screens/workspace/workspaceDetails";
import Workspace from "@/screens/workspace";
import PostProject from "@/screens/postProject";
import AddService from "@/screens/profile/addService";
import Services from "@/screens/services";
import ServiceDetails from "@/screens/services/serviceDetails";
import Projects from "@/screens/projects";
import EditProfile from "@/screens/profile/settings/editProfile";
import ChooseFreelancer from "@/screens/workspace/chooseFreelancer";
import Payment from "@/screens/payment";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { SecureStoreUtils } from "@/utils/SecureStore";

const Stack = createStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  BottomTab: { screen: string } | undefined;
  Settings: undefined;
  Projects: undefined;
  ProjectDetails: { projectId: string; clientId?: string };
  SignIn: undefined;
  SignUp: { role: "freelancer" | "client" } | undefined;
  ForgotPassword: undefined;
  Search: undefined;
  Freelancers: undefined;
  Workspace: undefined;
  WorkspaceDetails: { projectId: string; freelancerId?: string };
  PostProject: undefined;
  AddService: undefined;
  Services: undefined;
  ServiceDetails: { serviceId: string };
  DirectMessage: {
    userId: string;
    userName: string;
    userImage: string;
  };
  FreelancerDetails: {
    freelancerId: string;
  };
  EditProfile: undefined;
  ChooseFreelancer: { projectId: string };
  Payment: { projectId: string };
};

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Memeriksa token saat aplikasi dimulai
    checkAuthStatus();
  }, []);
  
  const checkAuthStatus = async () => {
    try {
      const token = await SecureStoreUtils.getToken();
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
    }
  };
  
  // Menampilkan loading screen saat memeriksa status autentikasi
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? "BottomTab" : "SignIn"}
      // initialRouteName="Payment"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="SignIn" 
        component={SignIn} 
        options={{ gestureEnabled: false }} 
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUp} 
      />
      <Stack.Screen 
        name="BottomTab" 
        component={BottomTab} 
        options={{ gestureEnabled: false }} 
      />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetails} />
      <Stack.Screen name="Projects" component={Projects} />
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="DirectMessage" component={DirectMessage} />
      <Stack.Screen name="Freelancers" component={Freelancers} />
      <Stack.Screen name="FreelancerDetails" component={FreelancerDetails} />
      <Stack.Screen name="Workspace" component={Workspace} />
      <Stack.Screen name="WorkspaceDetails" component={WorkspaceDetails} />
      <Stack.Screen name="PostProject" component={PostProject} />
      <Stack.Screen name="AddService" component={AddService} />
      <Stack.Screen name="Services" component={Services} />
      <Stack.Screen name="ServiceDetails" component={ServiceDetails} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="ChooseFreelancer" component={ChooseFreelancer} />
      <Stack.Screen name="Payment" component={Payment} />
    </Stack.Navigator>
  );
}
