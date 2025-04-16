import Header from "@/components/Header";
import MergePdf from "./components/MergePdf";
import Footer from "@/components/Footer";

export default function page() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Header />
        <MergePdf />
      </div>
      <Footer />
    </div>
  );
}
