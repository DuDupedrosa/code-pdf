import Header from "@/components/Header";
import Lock from "./components/Lock";
import Footer from "@/components/Footer";

export default function page() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Header />
        <Lock />
      </div>
      <Footer />
    </div>
  );
}
