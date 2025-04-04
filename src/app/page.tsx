import {
  faCompress,
  faFileExcel,
  faFileImage,
  faFilePowerpoint,
  faFileWord,
  faImage,
  faLock,
  faLockOpen,
  faObjectGroup,
  faRotate,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import ptJson from "@/translate/pt.json";

function CardAction({
  title,
  description,
  iconProps,
  toPath,
}: {
  title: string;
  description: string;
  iconProps: {
    icon: IconDefinition;
    color: string;
  };
  toPath: string;
}) {
  return (
    <Link
      href={`/${toPath}`}
      className="card w-full bg-base-300 shadow-sm md:w-64 p-5 cursor-pointer transition-all border border-transparent hover:border-primary"
    >
      <FontAwesomeIcon
        icon={iconProps.icon}
        className={`${iconProps.color} text-5xl w-9 h-9 mx-auto mb-2`}
      />
      <span className="text-lg mb-2 font-semibold text-center text-gray-50">
        {title}
      </span>
      <p className="text-center font-normal text-sm text-gray-400">
        {description}
      </p>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="px-8">
      {/* intro */}
      <div className="mt-12 md:mt-16">
        <h1 className="text-center text-3xl md:text-4xl font-semibold text-gray-50 mb-2">
          {ptJson.app_helper_pdf_title}
        </h1>
        <p className="text-center md:max-w-3xl text-base md:text-lg font-normal mx-auto text-gray-300">
          {ptJson.app_helper_pdf_description}
        </p>
      </div>

      {/* opções para manipular o pdf */}
      <div className="flex flex-col flex-wrap md:flex-row justify-center gap-5 items-stretch mt-12">
        <CardAction
          toPath="compress"
          iconProps={{
            color: "text-green-600",
            icon: faCompress,
          }}
          title={ptJson.compress_pdf}
          description={ptJson.compress_pdf_description}
        />

        <CardAction
          toPath="merge"
          iconProps={{
            color: "text-cyan-600",
            icon: faObjectGroup,
          }}
          title={ptJson.merge_pdf}
          description={`${ptJson.merge_pdf_description}.`}
        />

        <CardAction
          toPath="convert-images-to-pdf"
          iconProps={{
            color: "text-yellow-600",
            icon: faImage,
          }}
          title={ptJson.image_to_pdf}
          description={ptJson.image_to_pdf_description}
        />

        <CardAction
          toPath="word-to-pdf"
          iconProps={{
            color: "text-blue-600",
            icon: faFileWord,
          }}
          title={ptJson.word_pdf}
          description={`${ptJson.word_pdf_description}.`}
        />

        <CardAction
          toPath="excel-to-pdf"
          iconProps={{
            color: "text-green-600",
            icon: faFileExcel,
          }}
          title={ptJson.excel_pdf}
          description={`${ptJson.excel_pdf_description}.`}
        />

        <CardAction
          toPath="powerpoint-to-pdf"
          iconProps={{
            color: "text-orange-600",
            icon: faFilePowerpoint,
          }}
          title={ptJson.powerpoint_pdf}
          description={`${ptJson.powerpoint_pdf_description}.`}
        />

        <CardAction
          toPath="pdf-to-jpg"
          iconProps={{
            color: "text-indigo-600",
            icon: faFileImage,
          }}
          title={ptJson.pdf_jpg}
          description={`${ptJson.pdf_jpg_description}.`}
        />

        <CardAction
          toPath="rotate-pdf"
          iconProps={{
            color: "text-teal-600",
            icon: faRotate,
          }}
          title={ptJson.rotate_pdf}
          description={`${ptJson.rotate_pdf_description}.`}
        />

        <CardAction
          toPath="lock"
          iconProps={{
            color: "text-pink-600",
            icon: faLock,
          }}
          title={ptJson.lock_pdf}
          description={`${ptJson.lock_pdf_description}.`}
        />

        <CardAction
          toPath="unlock"
          iconProps={{
            color: "text-violet-600",
            icon: faLockOpen,
          }}
          title={ptJson.unlock_pdf}
          description={`${ptJson.unlock_pdf_description}.`}
        />
      </div>
    </div>
  );
}
