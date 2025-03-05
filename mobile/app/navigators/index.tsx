import { createStackNavigator } from "@react-navigation/stack";
import BottomTab from "./BottomTab";
import ProjectDetails from "@/screens/projects/projectDetails";
import Settings from "@/screens/tabs/profile/settings";
import SignIn from "@/screens/auth/signIn";
import SignUp from "@/screens/auth/signUp";
import SelectRole from "@/screens/auth/selectRole";
import Search from "@/screens/tabs/search";
import DirectMessage from "@/screens/tabs/inbox/directMessage";
import Freelancers from "@/screens/profileDetails/freelancers";
import FreelancerDetails from "@/screens/profileDetails/freelancers/freelancerDetails";
import WorkspaceDetails from "@/screens/tabs/workspace/workspaceDetails";
import Workspace from "@/screens/tabs/workspace";
import PostProject from "@/screens/postProject";
import AddService from "@/screens/tabs/profile/addService";
import Services from "@/screens/services";
import ServiceDetails from "@/screens/services/serviceDetails";
import Projects from "@/screens/projects";
import EditProfile from "@/screens/tabs/profile/settings/editProfile";
import EditService from "@/screens/tabs/profile/editService";
import ChooseFreelancer from "@/screens/tabs/workspace/chooseFreelancer";
import Payment from "@/screens/payment";
import Notifications from "@/screens/notifications";
import ProjectTerms from "@/screens/projects/projectDetails/projectTerms";
import { View, ActivityIndicator } from "react-native";
import ReviewPostProject from "@/screens/postProject/reviewPostProject";
import { useAuth } from "@/hooks/tanstack/useAuth";

const Stack = createStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  BottomTab: { screen: string } | undefined;
  Settings: undefined;
  Projects: undefined;
  ProjectDetails: { projectId: string; clientId?: string };
  SignIn: undefined;
  SelectRole: undefined;
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
    chatId: string;
    initialMessage?: string;
  };
  FreelancerDetails: {
    freelancerId: string;
  };
  EditProfile: undefined;
  ChooseFreelancer: { projectId: string };
  Payment: { 
    projectId?: string; 
    orderId?: string;
    fromPrePayment?: boolean;
  };
  EditService: { serviceId: string };
  ReviewPostProject: { 
    title: string;
    description: string;
    budget: number;
    category: string;
    location: string;
    completedDate: string;
    status: string;
    requirements: string;
    images: string[];
    clientId: string;
  };
  Notifications: undefined;
  ProjectTerms: {
    projectId: string;
  };
};

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // Menampilkan loading screen saat memeriksa status autentikasi
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
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
      <Stack.Screen name="BottomTab" component={BottomTab} options={{ gestureEnabled: false }} />

      {/* Auth */}
      <Stack.Screen name="SignIn" component={SignIn} options={{ animation: "fade_from_bottom", gestureEnabled: false }} />
      <Stack.Screen name="SelectRole" component={SelectRole} />
      <Stack.Screen name="SignUp" component={SignUp} />

      {/* Settings */}
      <Stack.Screen name="Settings" component={Settings} />

      {/* Projects */}
      <Stack.Screen name="ProjectDetails" component={ProjectDetails} />
      <Stack.Screen name="Projects" component={Projects} />
      <Stack.Screen name="ProjectTerms" component={ProjectTerms} />

      {/* Search */}
      <Stack.Screen name="DirectMessage" component={DirectMessage} />
      <Stack.Screen name="Search" component={Search} />

      {/* Freelancers */}
      <Stack.Screen name="Freelancers" component={Freelancers} options={{ animation: "fade_from_bottom" }} />
      <Stack.Screen name="FreelancerDetails" component={FreelancerDetails} />

      {/* Workspace */}
      <Stack.Screen name="Workspace" component={Workspace} />
      <Stack.Screen name="WorkspaceDetails" component={WorkspaceDetails} />
      <Stack.Screen name="PostProject" component={PostProject} />
      <Stack.Screen name="ReviewPostProject" component={ReviewPostProject} />
      
      {/* Services */}
      <Stack.Screen name="AddService" component={AddService} />
      <Stack.Screen name="EditService" component={EditService} />
      <Stack.Screen name="Services" component={Services} />
      <Stack.Screen name="ServiceDetails" component={ServiceDetails} />

      {/* Profile */}
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="ChooseFreelancer" component={ChooseFreelancer} />
      <Stack.Screen name="Payment" component={Payment} />

      {/* Notifications */}
      <Stack.Screen name="Notifications" component={Notifications} />
    </Stack.Navigator>
  );
}
