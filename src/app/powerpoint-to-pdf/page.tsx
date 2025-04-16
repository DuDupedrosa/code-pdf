import Header from "@/components/Header";
import PowerPointToPdf from "./components/PowerPointToPdf";
import Footer from "@/components/Footer";

export default function page() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Header />
        <PowerPointToPdf />
      </div>
      <Footer />
    </div>
  );
}
