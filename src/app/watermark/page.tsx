import Header from "@/components/Header";
import WaterMark from "./components/Watemark";
import Footer from "@/components/Footer";

export default function page() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Header />
        <WaterMark />
      </div>
      <Footer />
    </div>
  );
}
