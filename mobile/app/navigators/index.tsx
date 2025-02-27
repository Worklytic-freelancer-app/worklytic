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
import SignUpFreelancer from "@/screens/auth/signUp/freelancer";
import SignUpClient from "@/screens/auth/signUp/client";
import PostProject from "@/screens/postProject";
import AddService from "@/screens/profile/freelancer/addService";
import Services from "@/screens/services";
import ServiceDetails from "@/screens/services/serviceDetails";

const Stack = createStackNavigator();

export type RootStackParamList = {
  BottomTab: undefined;
  Settings: undefined;
  Projects: undefined;
  ProjectDetails: { projectId: number };
  SignIn: undefined;
  SignUp: undefined;
  SignUpFreelancer: undefined;
  SignUpClient: undefined;
  ForgotPassword: undefined;
  Search: undefined;
  Freelancers: undefined;
  Workspace: undefined;
  WorkspaceDetails: { projectId: number };
  PostProject: undefined;
  AddService: undefined;
  Services: undefined;
  ServiceDetails: { serviceId: number };
  DirectMessage: {
    userId: number;
    userName: string;
    userImage: string;
  };
  FreelancerDetails: {
    freelancerId: number;
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
      <Stack.Screen name="BottomTab" component={BottomTab} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetails} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="SignUpFreelancer" component={SignUpFreelancer} />
      <Stack.Screen name="SignUpClient" component={SignUpClient} />
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
    </Stack.Navigator>
  );
}
