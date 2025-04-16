import Header from "@/components/Header";
import ConvertImagesToPdf from "./components/ConvertImagesToPdf";
import Footer from "@/components/Footer";

export default function page() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Header />
        <ConvertImagesToPdf />
      </div>
      <Footer />
    </div>
  );
}
