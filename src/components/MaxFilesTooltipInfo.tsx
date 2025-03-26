import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ptJson from "@/translate/pt.json";

export default function MaxFilesTooltipInfo({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 md:max-w-1/2 mx-auto">
      <FontAwesomeIcon
        icon={faCircleInfo}
        className="w-4 h-4 text-lg text-blue-400"
      />
      <p className="text-xs md:text-sm font-medium text-gray-400">
        {text ?? ptJson.you_can_process_4_files}
      </p>
    </div>
  );
}
