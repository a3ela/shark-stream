import { MongoClient } from "mongodb";
const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.error("Please define the MONGODB_URL environment variable inside .env.local");
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.error("Please provide an email address as an argument.");
  console.error("Usage: npx tsx scripts/make-admin.ts <email>");
  process.exit(1);
}

async function makeAdmin() {
  const client = new MongoClient(MONGODB_URL as string);
  try {
    await client.connect();
    const db = client.db();
    const result = await db
      .collection("user")
      .updateOne({ email }, { $set: { role: "admin" } });

    if (result.matchedCount === 0) {
      console.log(`No user found with email: ${email}`);
    } else if (result.modifiedCount === 0) {
      console.log(`User ${email} is already an admin.`);
    } else {
      console.log(`Successfully made ${email} an admin!`);
    }
  } catch (error) {
    console.error("Error making user admin:", error);
  } finally {
    await client.close();
  }
}

makeAdmin();
