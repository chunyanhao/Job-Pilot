import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { ProfilePageContent } from "@/components/profile/ProfilePageContent";
import { calculateProfileCompletion, parseProfileRecord } from "@/lib/profile";
import { createInsforgeServer, getCurrentUser } from "@/lib/insforge-server";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=%2Fprofile");
  }

  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const email = typeof user.email === "string" ? user.email : "";

  if (error) {
    console.error("[app/profile] Failed to load profile", error.message);
  }

  const initialValues = parseProfileRecord(error ? null : data, email);
  const initialCompletion = calculateProfileCompletion(initialValues);

  return (
    <>
      <AppNavbar />
      <ProfilePageContent initialValues={initialValues} initialCompletion={initialCompletion} />
    </>
  );
}
