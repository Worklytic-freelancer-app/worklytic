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
import MyProjectDetails from "@/screens/myProjects/myProjectDetails";
import MyProjects from "@/screens/myProjects";
import SignUpFreelancer from "@/screens/auth/signUp/freelancer";
import SignUpClient from "@/screens/auth/signUp/client";

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
  MyProjects: undefined;
  MyProjectDetails: { projectId: number };
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
      <Stack.Screen name="MyProjects" component={MyProjects} />
      <Stack.Screen name="MyProjectDetails" component={MyProjectDetails} />
    </Stack.Navigator>
  );
}
