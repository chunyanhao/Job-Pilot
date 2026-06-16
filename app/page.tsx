import { HomeFooter } from "@/components/layout/HomeFooter";
import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { BottomCta } from "@/components/homepage/BottomCta";
import { FeatureSections } from "@/components/homepage/FeatureSections";
import { Hero } from "@/components/homepage/Hero";
import { Testimonial } from "@/components/homepage/Testimonial";
import { getCurrentUser } from "@/lib/insforge-server";

export default async function Home() {
  const user = await getCurrentUser();
  const appHref = user ? "/dashboard" : "/login";

  return (
    <main className="min-h-screen bg-background">
      <HomeNavbar ctaHref={appHref} />
      <Hero primaryHref={appHref} />
      <FeatureSections />
      <Testimonial />
      <BottomCta primaryHref={appHref} />
      <HomeFooter />
    </main>
  );
}
