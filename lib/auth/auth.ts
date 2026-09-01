import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { headers } from "next/headers";

const client = new MongoClient(process.env.MONGODB_URL as string);

const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: false,
      },
    },
  },
});

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function signIn(email: string, password: string) {
  return auth.api.signInEmail({
    body: { email, password },
    headers: await headers(),
  });
}

export async function signUp(email: string, password: string, name: string) {
  return auth.api.signUpEmail({
    body: { email, password, name },
    headers: await headers(),
  });
}

export async function signOut() {
  return auth.api.signOut({
    headers: await headers(),
  });
}
