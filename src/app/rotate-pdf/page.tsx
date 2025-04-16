import Header from "@/components/Header";
import RotatePdf from "./components/Rotate";
import Footer from "@/components/Footer";

export default function page() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Header />
        <RotatePdf />
      </div>
      <Footer />
    </div>
  );
}
