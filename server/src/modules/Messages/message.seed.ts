import { db } from "../../config";
import { ObjectId } from "mongodb";
import sampleData from "../../data/messages.json";

export async function seed() {
    try {
        const collection = await db.collection("Messages");
        
        // Transform data dari json ke format MongoDB
        const values = sampleData.map(data => ({
            _id: new ObjectId(), // generate ObjectId baru
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await collection.insertMany(values);
        
        console.log('✅ Seeding Message completed successfully');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

export async function unseed() {
    try {
        const collection = await db.collection("Messages");
        await collection.deleteMany({});
        
        console.log('✅ Unseeding Message completed successfully');
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