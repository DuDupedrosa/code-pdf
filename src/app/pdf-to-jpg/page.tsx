import Header from "@/components/Header";
import PdfToJpg from "./components/PdfToJpg";
import Footer from "@/components/Footer";

export default function page() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Header />
        <PdfToJpg />
      </div>
      <Footer />
    </div>
  );
}
