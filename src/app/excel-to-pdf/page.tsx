import Header from "@/components/Header";
import ExcelToPdf from "./components/ExcelToPdf";
import Footer from "@/components/Footer";

export default function page() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Header />
        <ExcelToPdf />
      </div>
      <Footer />
    </div>
  );
}
