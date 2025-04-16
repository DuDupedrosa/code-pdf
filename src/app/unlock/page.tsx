import Header from "@/components/Header";
import UnLock from "./components/Unlock";
import Footer from "@/components/Footer";

export default function page() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Header />
        <UnLock />
      </div>
      <Footer />
    </div>
  );
}
