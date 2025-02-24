import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, CheckCircle2, XCircle } from "lucide-react-native";

interface MyProject {
  id: number;
  title: string;
  budget: string;
  status: "pending" | "accepted" | "rejected";
  appliedDate: string;
  company: {
    name: string;
    image: string;
  };
  image: string;
}

export default function MyProjects() {
  const insets = useSafeAreaInsets();

  const myProjects: MyProject[] = [
    {
      id: 1,
      title: "Mobile App Development",
      budget: "$2,500",
      status: "pending",
      appliedDate: "2 days ago",
      company: {
        name: "Tech Solutions Inc.",
        image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60",
      },
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: 2,
      title: "Website Redesign",
      budget: "$1,800",
      status: "accepted",
      appliedDate: "1 week ago",
      company: {
        name: "Creative Agency",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60",
      },
      image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop&q=60",
    },
  ];

  const getStatusColor = (status: MyProject["status"]) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "accepted":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status: MyProject["status"]) => {
    switch (status) {
      case "pending":
        return <Clock size={16} color="#f59e0b" />;
      case "accepted":
        return <CheckCircle2 size={16} color="#10b981" />;
      case "rejected":
        return <XCircle size={16} color="#ef4444" />;
    }
  };

  const renderProject = ({ item }: { item: MyProject }) => (
    <TouchableOpacity style={styles.projectCard}>
      <Image source={{ uri: item.image }} style={styles.projectImage} />
      <View style={styles.projectInfo}>
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
            {getStatusIcon(item.status)}
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
          </View>
        </View>
        <Text style={styles.projectBudget}>{item.budget}</Text>
        <View style={styles.companyInfo}>
          <Image source={{ uri: item.company.image }} style={styles.companyImage} />
          <View>
            <Text style={styles.companyName}>{item.company.name}</Text>
            <Text style={styles.appliedDate}>Applied {item.appliedDate}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Projects</Text>
      </View>

      <FlatList<MyProject> data={myProjects} renderItem={renderProject} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.projectsList} showsVerticalScrollIndicator={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  projectsList: {
    padding: 20,
  },
  projectCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  projectImage: {
    width: "100%",
    height: 140,
  },
  projectInfo: {
    padding: 16,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  projectTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  projectBudget: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  companyImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  appliedDate: {
    fontSize: 13,
    color: "#6b7280",
  },
});
