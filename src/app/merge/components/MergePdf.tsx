"use client";

import PageIntroTitle from "@/components/PageIntroTitle";
import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import ptJson from "@/translate/pt.json";
import SelectedFile from "@/components/SelectedFile";
import ButtonActionFile from "@/components/ButtonActionFile";
import { downloadFile } from "@/helpers/methods/fileHelper";
import { getFetchErroMessage } from "@/helpers/methods/fetchHelper";
import { pageMainSection } from "@/style/section";
import MainFileLoading from "@/components/MainFileLoading";
import SuccessFinishedTask from "@/components/SuccessFinishedTask";
import MaxFilesTooltipInfo from "@/components/MaxFilesTooltipInfo";
import AlertErro from "@/components/AlertErro";
import { getDateToFileConverted } from "@/helpers/methods/dateHelper";
import { getApiBaseUrl } from "@/helpers/methods/getApiBaseUrl";

export default function MergePdf() {
  const [files, setFiles] = useState<File[] | []>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [finishedTask, setFinishedTask] = useState<boolean>(false);
  const [blobFile, setBlobFile] = useState<Blob | null>(null);
  const toastShownRef = useRef(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles((prevFiles) => {
        const totalFiles = [...prevFiles, ...acceptedFiles].length;

        if (totalFiles > 2 && !toastShownRef.current) {
          toast.warning(ptJson.you_can_process_2_files, {
            position: "top-center",
          });
          toastShownRef.current = true;
          setTimeout(() => {
            toastShownRef.current = false;
          }, 2000);
        }

        return [...prevFiles, ...acceptedFiles].slice(0, 2);
      });
    },
    [ptJson.you_can_process_2_files, setFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  const mergeFiles = async () => {
    setAlertMessage("");
    try {
      if (!files || files.length <= 0) {
        toast.warning(ptJson.select_file_to_continue, {
          position: "top-center",
        });
        return;
      }

      if (files.length === 1) {
        toast.warning(ptJson.require_min_2_pdf_to_merge, {
          position: "top-center",
        });
        return;
      }

      if (files.length > 2) {
        toast.warning(ptJson.you_can_process_2_files, {
          position: "top-center",
        });
        return;
      }

      setLoading(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("file", file);
      });

      const resp = await fetch(`${getApiBaseUrl()}/merge`, {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const errorMessage = await getFetchErroMessage(resp);
        if (errorMessage) {
          setAlertMessage(errorMessage);
        }
        return;
      }

      const blobFile = await resp.blob();
      setBlobFile(blobFile);
      downloadFile({
        fileName: `merged-pdf-${getDateToFileConverted()}.pdf`,
        blobFile: blobFile,
      });
      setFinishedTask(true);
      setFiles([]);
    } catch (err) {
      void err;
      setAlertMessage(ptJson.default_error_message_full);
    } finally {
      setLoading(false);
    }
  };

  function handleDownloadFile() {
    if (!blobFile) {
      toast.error(ptJson.default_error_message);
      return;
    }
    downloadFile({
      fileName: `merged-pdf-${getDateToFileConverted()}.pdf`,
      blobFile: blobFile,
    });
  }

  function handleBackAction() {
    setFiles([]);
    setFinishedTask(false);
    setBlobFile(null);
  }

  return (
    <div className={pageMainSection}>
      {loading && <MainFileLoading text={ptJson.merge_progress_text} />}

      {!loading && finishedTask && (
        <SuccessFinishedTask
          title={ptJson.success_merge_pdfs}
          downloadButtonText={ptJson.download_pdf}
          backButton={ptJson.merge_more}
          onDownload={() => handleDownloadFile()}
          backAction={() => handleBackAction()}
        />
      )}

      {!loading && !finishedTask && (
        <div>
          <PageIntroTitle
            title={ptJson.merge_pdf}
            subtitle={ptJson.merge_pdf_description}
          />

          <MaxFilesTooltipInfo text={ptJson.you_can_process_2_files} />

          <div
            {...getRootProps()}
            className="border-2 md:max-w-1/2 mx-auto mt-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-primary text-xl">{ptJson.drop_file_spread}</p>
            ) : (
              <p className="text-primary text-xl">
                {ptJson.click_or_drop_file}
              </p>
            )}
          </div>

          {files && files.length > 0 && (
            <SelectedFile
              files={files}
              onChangeIndex={(files: File[]) => setFiles(files)}
            />
          )}

          <div className="max-w-full mt-5 md:max-w-1/2 mx-auto">
            <AlertErro
              scrollToBottom={true}
              message={alertMessage}
              open={alertMessage.length > 0}
              onClose={() => setAlertMessage("")}
            />
          </div>

          <ButtonActionFile
            label={ptJson.merge_files}
            loadingLabel={""}
            loading={loading}
            onAction={() => mergeFiles()}
          />
        </div>
      )}
    </div>
  );
}
