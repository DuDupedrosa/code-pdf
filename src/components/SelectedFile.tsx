import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SelectedFile({
  files,
  onRemoveFile,
}: {
  files: File[] | [];
  onRemoveFile: (index: number) => void;
}) {
  return (
    <div className="mt-5 md:max-w-1/2 mx-auto">
      <h3 className="text-lg font-semibold">Arquivos Selecionados:</h3>
      <ul className="mt-2 text-gray-700 flex flex-col gap-5">
        {files.map((file, index) => (
          <li
            key={index}
            className="border border-gray-600 p-2 rounded-lg shadow-sm flex items-center justify-between gap-5"
          >
            <span className="text-gray-50">
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </span>

            <button
              className="btn btn-sm btn-error"
              onClick={() => onRemoveFile(index)}
            >
              <FontAwesomeIcon
                icon={faTrashCan}
                className="w-5 h-5 text-xl text-gray-50"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
