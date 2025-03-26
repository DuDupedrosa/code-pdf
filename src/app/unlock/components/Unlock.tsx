"use client";

import PageIntroTitle from "@/components/PageIntroTitle";
import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import ptJson from "@/translate/pt.json";
import SelectedFile from "@/components/SelectedFile";
import ButtonActionFile from "@/components/ButtonActionFile";
import { downloadFile, removeFileByIndex } from "@/helpers/methods/fileHelper";
import { showFetchErroMessage } from "@/helpers/methods/fetchHelper";
import { pageMainSection } from "@/style/section";
import SuccessFinishedTask from "@/components/SuccessFinishedTask";
import MaxFilesTooltipInfo from "@/components/MaxFilesTooltipInfo";
import { format } from "date-fns";
import MainFileLoading from "@/components/MainFileLoading";

export default function UnLock() {
  const [files, setFiles] = useState<File[] | []>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [finishedTask, setFinishedTask] = useState<boolean>(false);
  const [blobFile, setBlobFile] = useState<Blob | null>(null);
  const toastShownRef = useRef(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles((prevFiles) => {
        const totalFiles = [...prevFiles, ...acceptedFiles].length;

        if (totalFiles > 1 && !toastShownRef.current) {
          toast.warning(ptJson.you_can_process_1_files);
          toastShownRef.current = true;
          setTimeout(() => {
            toastShownRef.current = false;
          }, 2000);
        }

        return [...prevFiles, ...acceptedFiles].slice(0, 1);
      });
    },
    [ptJson.you_can_process_1_files, setFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  const lockFile = async () => {
    try {
      if (!files || files.length <= 0) {
        toast.warning(ptJson.select_file_to_continue);
        return;
      }

      if (files.length > 1) {
        toast.warning(ptJson.you_can_process_1_files);
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("file", files[0]);

      const resp = await fetch("/api/unlock-pdf", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        showFetchErroMessage(resp);
        return;
      }

      const formatDate = format(new Date(), "dd-MM-yy-HH:mm:ss");
      const blobFile = await resp.blob();
      setBlobFile(blobFile);
      downloadFile({
        fileName: `unlock-pdf-${formatDate}.pdf`,
        blobFile: blobFile,
      });
      setFinishedTask(true);
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

  function handleDownloadFile() {
    const formatDate = format(new Date(), "dd-MM-yy-HH:mm:ss");

    if (blobFile) {
      downloadFile({
        fileName: `unlock-pdf-${formatDate}.pdf`,
        blobFile: blobFile,
      });
    }
  }

  function handleBackAction() {
    setFiles([]);
    setFinishedTask(false);
    setBlobFile(null);
  }

  return (
    <div className={pageMainSection}>
      {!loading && finishedTask && (
        <SuccessFinishedTask
          title={ptJson.unlocked_pdf_success}
          downloadButtonText={ptJson.download_pdf}
          backButton={ptJson.unlock_another_pdf}
          onDownload={() => handleDownloadFile()}
          backAction={() => handleBackAction()}
        />
      )}

      {loading && <MainFileLoading text={ptJson.unlock_progress_text} />}

      {!loading && !finishedTask && (
        <div>
          <PageIntroTitle
            title={ptJson.unlock_pdf}
            subtitle={ptJson.unlock_pdf_description}
          />

          <MaxFilesTooltipInfo text={ptJson.you_can_process_1_files} />

          <div
            {...getRootProps()}
            className="border-2 md:max-w-1/2 mx-auto mt-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-primary text-xl">{ptJson.drop_file_spread}</p>
            ) : (
              <p className="text-primary text-xl">{ptJson.click_or_drop_pdf}</p>
            )}
          </div>

          {files && files.length > 0 && (
            <>
              <SelectedFile
                onRemoveFile={(index: number) => handleRemoveFile(index)}
                files={files}
              />
            </>
          )}

          <ButtonActionFile
            loading={loading}
            onAction={() => lockFile()}
            label={ptJson.unlock_pdf_single}
            loadingLabel={""}
          />
        </div>
      )}
    </div>
  );
}
