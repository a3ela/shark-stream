import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/signin");
  }

  return <div>{children}</div>;
}
