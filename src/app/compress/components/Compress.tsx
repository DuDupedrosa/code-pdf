"use client";

import PageIntroTitle from "@/components/PageIntroTitle";
import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import ptJson from "@/translate/pt.json";
import SelectedFile from "@/components/SelectedFile";
import ButtonActionFile from "@/components/ButtonActionFile";
import { downloadFile, downloadZip } from "@/helpers/methods/fileHelper";
import { getFetchErroMessage } from "@/helpers/methods/fetchHelper";
import { pageMainSection } from "@/style/section";
import SuccessFinishedTask from "@/components/SuccessFinishedTask";
import MaxFilesTooltipInfo from "@/components/MaxFilesTooltipInfo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import MainFileLoading from "@/components/MainFileLoading";
import AlertErro from "@/components/AlertErro";
import { getDateToFileConverted } from "@/helpers/methods/dateHelper";
import { getApiBaseUrl } from "@/helpers/methods/getApiBaseUrl";

const radioLabel =
  "label cursor-pointer whitespace-break-spaces flex items-start gap-2 w-full";
const radioInput = "radio radio-sm mt-1 checked:text-primary";
const radioLabelTextInfo = "text-gray-400 text-xs";

const compressionLevelOptions = {
  extreme: "extreme",
  recommended: "recommended",
  low: "low",
};

export default function Compress() {
  const [files, setFiles] = useState<File[] | []>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [finishedTask, setFinishedTask] = useState<boolean>(false);
  const [compressionLevel, setCompressionLevel] = useState(
    compressionLevelOptions.recommended
  );
  const [blobFile, setBlobFile] = useState<Blob | null>(null);
  const [bufferFile, setBufferFile] = useState<ArrayBuffer | null>(null);
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

  const compressFile = async () => {
    setAlertMessage("");
    try {
      if (!files || files.length <= 0) {
        toast.warning(ptJson.select_file_to_continue, {
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
      formData.append("compressionLevel", String(compressionLevel));
      files.forEach((file) => {
        formData.append("file", file);
      });

      const resp = await fetch(`${getApiBaseUrl()}/compress`, {
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

      const pdfName = `compressed-pdf-${getDateToFileConverted()}`;

      if (files.length === 1) {
        const blobFile = await resp.blob();
        setBlobFile(blobFile);
        downloadFile({
          fileName: `${pdfName}.pdf`,
          blobFile: blobFile,
        });
      } else {
        const buffer = await resp.arrayBuffer();
        setBufferFile(buffer);
        downloadZip(buffer, `${pdfName}.zip`);
      }

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
    const pdfName = `compressed-pdf-${getDateToFileConverted()}`;
    if (!blobFile && !bufferFile) {
      toast.error(ptJson.default_error_message);
    }

    if (blobFile) {
      downloadFile({
        fileName: `${pdfName}.pdf`,
        blobFile: blobFile,
      });
    }

    if (bufferFile) {
      downloadZip(bufferFile, `${pdfName}.zip`);
    }
  }

  function handleBackAction() {
    setFiles([]);
    setCompressionLevel(compressionLevelOptions.recommended);
    setFinishedTask(false);
    setBlobFile(null);
    setBufferFile(null);
  }

  return (
    <div className={pageMainSection}>
      {!loading && finishedTask && (
        <SuccessFinishedTask
          title={
            blobFile ? ptJson.compress_success : ptJson.compress_success_files
          }
          downloadButtonText={
            blobFile ? ptJson.download_pdf : ptJson.download_pdfs
          }
          backButton={ptJson.compress_another_pdf}
          onDownload={() => handleDownloadFile()}
          backAction={() => handleBackAction()}
        />
      )}

      {loading && <MainFileLoading text={ptJson.compress_in_progress_text} />}

      {!loading && !finishedTask && (
        <div>
          <PageIntroTitle
            title={ptJson.compress_pdf}
            subtitle={ptJson.compress_pdf_subtitle}
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
              <p className="text-primary text-xl">{ptJson.click_or_drop_pdf}</p>
            )}
          </div>

          {files && files.length > 0 && (
            <>
              <SelectedFile
                files={files}
                onChangeIndex={(newFiles: File[]) => setFiles(newFiles)}
              />

              <div className="mt-5 md:max-w-1/2 mx-auto">
                <h3 className="text-lg font-semibold flex text-gray-50 items-center gap-2">
                  <FontAwesomeIcon
                    icon={faGear}
                    className="text-gray-400 text-lg w-5 h-5"
                  />
                  {ptJson.compression_level}:
                </h3>

                <div className="mt-5 flex flex-col gap-3">
                  <label className={radioLabel}>
                    <input
                      type="radio"
                      name="compression-level"
                      value={compressionLevelOptions.extreme}
                      className={radioInput}
                      checked={
                        compressionLevel === compressionLevelOptions.extreme
                      }
                      onChange={() =>
                        setCompressionLevel(compressionLevelOptions.extreme)
                      }
                    />
                    <span className="w-full">
                      {ptJson.max_compress} <br />
                      <span className={radioLabelTextInfo}>
                        {ptJson.max_compress_description}
                      </span>
                    </span>
                  </label>

                  <div>
                    <label className={radioLabel}>
                      <input
                        type="radio"
                        name="compression-level"
                        value={compressionLevelOptions.recommended}
                        className={radioInput}
                        checked={
                          compressionLevel ===
                          compressionLevelOptions.recommended
                        }
                        onChange={() =>
                          setCompressionLevel(
                            compressionLevelOptions.recommended
                          )
                        }
                      />
                      <span className="w-full">
                        {ptJson.regular_compress} <br />
                        <span className={radioLabelTextInfo}>
                          {ptJson.regular_compress_description}
                        </span>
                      </span>
                    </label>
                  </div>

                  <label className={radioLabel}>
                    <input
                      type="radio"
                      name="compression-level"
                      value={compressionLevelOptions.low}
                      className={radioInput}
                      checked={compressionLevel === compressionLevelOptions.low}
                      onChange={() =>
                        setCompressionLevel(compressionLevelOptions.low)
                      }
                    />
                    <span className="w-full">
                      {ptJson.low_compress} <br />
                      <span className={radioLabelTextInfo}>
                        {ptJson.low_compress_description}
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </>
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
            loading={loading}
            onAction={() => compressFile()}
            label={
              files && files.length > 1
                ? ptJson.compress_files
                : ptJson.compress_file
            }
            loadingLabel={ptJson.waiting_loading_your_file}
          />
        </div>
      )}
    </div>
  );
}
