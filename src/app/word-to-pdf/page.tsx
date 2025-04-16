import Header from "@/components/Header";
import WordToPdf from "./components/WordToPdf";
import Footer from "@/components/Footer";

export default function page() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Header />
        <WordToPdf />
      </div>
      <Footer />
    </div>
  );
}
