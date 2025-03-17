"use client";

import PageIntroTitle from "@/components/PageIntroTitle";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import ptJson from "@/translate/pt.json";
import SelectedFile from "@/components/SelectedFile";
import ButtonActionFile from "@/components/ButtonActionFile";
import { downloadFile, removeFileByIndex } from "@/helpers/methods/fileHelper";
import { showFetchErroMessage } from "@/helpers/methods/fetchHelper";
import { pageMainSection } from "@/style/section";

export default function Compress() {
  const [files, setFiles] = useState<File[] | []>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "application/pdf": [".pdf"] },
  });

  const compressFile = async () => {
    try {
      setLoading(true);
      if (!files || files.length <= 0) {
        toast.warning(ptJson.select_file_to_continue);
        return;
      }

      const formData = new FormData();
      formData.append("file", files[0]);

      const resp = await fetch("/api/compress-pdf", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        showFetchErroMessage(resp);
        return;
      }

      downloadFile({ fileName: `compressed-${files[0].name}`, resp: resp });
      setFiles([]);
    } catch (err) {
      void err;
      toast.error(ptJson.default_error_message);
    } finally {
      setLoading(false);
    }
  };

  function handleRemoveFile(index: number) {
    setFiles(removeFileByIndex(files, index));
  }

  return (
    <div className={pageMainSection}>
      <PageIntroTitle
        title={ptJson.compress_pdf}
        subtitle={ptJson.click_or_drop_pdf}
      />

      <div
        {...getRootProps()}
        className="border-2 md:max-w-1/2 mx-auto mt-8 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-primary text-xl">{ptJson.drop_file_spread}</p>
        ) : (
          <p className="text-primary text-xl">{ptJson.click_or_drop_file}</p>
        )}
      </div>

      {files && files.length > 0 && (
        <SelectedFile
          onRemoveFile={(index: number) => handleRemoveFile(index)}
          files={files}
        />
      )}

      <ButtonActionFile
        loading={loading}
        onAction={() => compressFile()}
        label={ptJson.compress_file}
        loadingLabel={ptJson.waiting_loading_your_file}
      />
    </div>
  );
}
