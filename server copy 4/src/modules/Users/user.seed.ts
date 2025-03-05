import { db } from "../../config";
import { ObjectId } from "mongodb";
import sampleData from "../../data/users.json";
import { hashText } from "../../utils/bcrypt";

export async function seed() {
    try {
        const collection = await db.collection("Users");
        
        // Transform data dari json ke format MongoDB
        const values = sampleData.map(data => ({
            ...data,
            _id: new ObjectId(data._id), // generate ObjectId baru
            password: hashText(data.password),
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await collection.insertMany(values);
        
        console.log('✅ Seeding User completed successfully');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

export async function unseed() {
    try {
        const collection = await db.collection("Users");
        await collection.deleteMany({});
        
        console.log('✅ Unseeding User completed successfully');
    } catch (error) {
        console.error('❌ Unseeding failed:', error);
        throw error;
    }
}

// Run seeding
if (process.argv[2] === 'seed') {
    seed()
        .catch(console.error)
        .finally(() => process.exit());
}

if (process.argv[2] === 'unseed') {
    unseed()
        .catch(console.error)
        .finally(() => process.exit());
}