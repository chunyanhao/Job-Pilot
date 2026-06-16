import { AuthCallback } from "@/components/auth/AuthCallback";
import { HomeNavbar } from "@/components/layout/HomeNavbar";

export default function CallbackPage() {
  return (
    <main className="min-h-screen bg-background">
      <HomeNavbar ctaHref="/login" />
      <AuthCallback />
    </main>
  );
}
