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
import Profile from "@/screens/profile";
import EditProfile from "@/screens/profile/settings/editProfile";
import ChooseFreelancer from "@/screens/workspace/chooseFreelancer";
import Payment from "@/screens/payment";
import ReviewPostProject from "@/screens/postProject/reviewPostProject";

const Stack = createStackNavigator();

export type RootStackParamList = {
  BottomTab: undefined;
  Settings: undefined;
  Projects: undefined;
  ProjectDetails: { projectId: string; clientId: string };
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
  Payment: undefined;
  ReviewPostProject: {
    title: string;
    description: string;
    budget: string;
    category: string;
    location: string;
    duration: string;
    requirements: string;
    images: string[];
  };
};

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="BottomTab" component={BottomTab} />
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
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="ChooseFreelancer" component={ChooseFreelancer} />
      <Stack.Screen name="Payment" component={Payment} />
      <Stack.Screen name="ReviewPostProject" component={ReviewPostProject} />
    </Stack.Navigator>
  );
}
