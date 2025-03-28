import { faFile, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ptJson from "@/translate/pt.json";
import { useEffect, useState } from "react";
import { removeFileByIndex } from "@/helpers/methods/fileHelper";

export default function SelectedFile({
  files,
  onChangeIndex,
}: {
  files: File[] | [];
  onChangeIndex: (files: File[]) => void;
}) {
  const [items, setItems] = useState<File[]>([]);
  const [changeIndex, setChangeIndex] = useState<boolean>(false);

  function handleChangeIndex(file: File, newIndex: number) {
    setItems((prevItems) => {
      const currentIndex = prevItems.indexOf(file);

      if (
        currentIndex === -1 ||
        newIndex < 0 ||
        newIndex >= prevItems.length ||
        currentIndex === newIndex
      ) {
        return prevItems;
      }

      const updatedItems = [...prevItems];

      updatedItems.splice(currentIndex, 1);

      updatedItems.splice(newIndex, 0, file);
      setChangeIndex(true);
      return updatedItems;
    });
  }

  function handleRemoveFile(index: number) {
    const removedFileArray = removeFileByIndex(items, index);
    setItems(removedFileArray);
    onChangeIndex(removedFileArray);
  }

  useEffect(() => {
    if (files && files.length > 0 && files.length > items.length) {
      setItems(files);
    }
  }, [files]);

  useEffect(() => {
    if (changeIndex) {
      onChangeIndex(items);
      setChangeIndex(false);
    }
  }, [items, changeIndex]);

  return (
    <div className="mt-12 md:max-w-1/2 mx-auto">
      <h3 className="text-lg font-semibold flex text-gray-50 items-center gap-2">
        <FontAwesomeIcon
          icon={faFile}
          className="text-gray-400 text-lg w-5 h-5"
        />
        {items.length > 1 ? ptJson.selected_files : ptJson.selected_file}:
      </h3>
      <ul className="mt-5 text-gray-700 flex flex-col gap-5">
        {items.map((file, index) => (
          <li
            key={index}
            className="border border-gray-600 p-2 rounded-lg shadow-sm flex items-center justify-between gap-5 relative"
          >
            <span className="text-gray-50">
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </span>

            <select
              onChange={(e) => handleChangeIndex(file, Number(e.target.value))}
              value={String(index)}
              className="select select-sm select-primary text-white max-w-max cursor-pointer mr-6"
            >
              {items.map((_, fileIndex) => {
                return (
                  <option key={fileIndex} value={String(fileIndex)}>
                    {fileIndex + 1}
                  </option>
                );
              })}
            </select>

            <button
              title="Remover arquivo"
              className="btn btn-circle btn-error btn-xs absolute -right-1 -top-2"
              onClick={() => handleRemoveFile(index)}
            >
              <FontAwesomeIcon
                icon={faXmark}
                className="text-base text-gray-50"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
