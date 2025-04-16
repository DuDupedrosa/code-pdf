import Header from "@/components/Header";
import AddPageNumber from "./components/AddPageNumber";
import Footer from "@/components/Footer";

export default function page() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Header />
        <AddPageNumber />
      </div>
      <Footer />
    </div>
  );
}
