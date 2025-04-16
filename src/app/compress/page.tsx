import Header from "@/components/Header";
import Compress from "./components/Compress";
import Footer from "@/components/Footer";

export default function page() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Header />
        <Compress />
      </div>
      <Footer />
    </div>
  );
}
