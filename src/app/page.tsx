import { Home } from "@/components/Home";
import { Navbar, Footer } from "@/components/client";
import { SupportWidget } from "@/components/SupportWidget";

export default function RootPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* We'll handle navbar/footer visibility in a client wrapper or here */}
      <Navbar />
      <main>
        <Home />
      </main>
      <Footer />
      <SupportWidget />
    </div>
  );
}
