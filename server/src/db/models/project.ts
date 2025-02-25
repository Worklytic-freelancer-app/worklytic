import { getDb } from "../config/mongoConnection";

export type ProjectModel = {
  name: string;
  description: string;
  owner: string;
  members: string[];
  tasks: string[];
};

export const findAll = async () => {
  const db = await getDb();
  const collection = db.collection("projects");
  const projects = await collection.find().toArray();
  return projects;
};

// export const findById = async (id: string) => {
//   const db = await getDb();
//   const collection = db.collection("projects");
//   const project = await collection.findOne({ _id: id });
//   return project;
// };
