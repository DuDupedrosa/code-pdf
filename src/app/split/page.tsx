import Header from "@/components/Header";
import Split from "./components/Split";
import Footer from "@/components/Footer";

export default function page() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Header />
        <Split />
      </div>
      <Footer />
    </div>
  );
}
