import { redirect } from "next/navigation";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { getCurrentUser } from "@/lib/insforge-server";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background">
      <HomeNavbar ctaHref="/login" />
      <LoginPanel />
    </main>
  );
}
