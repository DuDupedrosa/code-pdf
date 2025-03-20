import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PageIntroTitle from "./PageIntroTitle";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import SuccessImage from "@/assets/checked.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ptJson from "@/translate/pt.json";

export default function SuccessFinishedTask({
  title,
  downloadButtonText,
  backButton,
  onDownload,
  backAction,
}: {
  title: string;
  downloadButtonText: string;
  backButton: string;
  onDownload: () => void;
  backAction: () => void;
}) {
  const router = useRouter();

  return (
    <div>
      <Image src={SuccessImage} alt="success" className="w-20 mx-auto mb-8" />
      <PageIntroTitle
        title={title}
        subtitle={ptJson.select_one_option_to_progress}
      />

      <div className="max-w-max mx-auto flex flex-col items-center gap-4">
        {/* Botão de Download */}
        <button
          onClick={() => onDownload()}
          className="btn btn-primary btn-xl flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faDownload} className="w-5 h-5 text-lg" />
          {downloadButtonText}
        </button>

        {/* Opções extras */}
        <div className="flex gap-2 items-center mt-5">
          <button
            onClick={() => backAction()}
            className="btn btn-outline btn-md"
          >
            {backButton}
          </button>
          <button
            onClick={() => router.push("/")}
            className="btn btn-neutral btn-md"
          >
            {ptJson.back_to_menu}
          </button>
        </div>
      </div>
    </div>
  );
}
