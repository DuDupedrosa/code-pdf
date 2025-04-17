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
import MainFileLoading from "@/components/MainFileLoading";
import AlertErro from "@/components/AlertErro";
import { getDateToFileConverted } from "@/helpers/methods/dateHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { getApiBaseUrl } from "@/helpers/methods/getApiBaseUrl";

const radioLabel =
  "label cursor-pointer whitespace-break-spaces flex items-start gap-2 w-full";
const radioInput = "radio radio-sm mt-1 checked:text-primary";
const radioLabelTextInfo = "text-gray-400 text-xs";

const modeOptions = {
  page: "pages",
  extract: "extract",
};
const imageType = "image/jpeg";

export default function WordToPdf() {
  const [files, setFiles] = useState<File[] | []>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [finishedTask, setFinishedTask] = useState<boolean>(false);
  const [blobFile, setBlobFile] = useState<Blob | null>(null);
  const toastShownRef = useRef(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [mode, setMode] = useState<string>(modeOptions.page);
  const [bufferFile, setBufferFile] = useState<ArrayBuffer | null>(null);
  const [respContentType, setRespContentType] = useState<string>("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles((prevFiles) => {
        const totalFiles = [...prevFiles, ...acceptedFiles].length;

        if (totalFiles > 1 && !toastShownRef.current) {
          toast.warning(ptJson.you_can_process_1_files, {
            position: "top-center",
          });
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
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const pdfToJpg = async () => {
    setAlertMessage("");
    try {
      if (!files || files.length <= 0) {
        toast.warning(ptJson.select_file_to_continue, {
          position: "top-center",
        });
        return;
      }

      if (files.length > 1) {
        toast.warning(ptJson.you_can_process_1_files, {
          position: "top-center",
        });
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("mode", mode);

      const resp = await fetch(`${getApiBaseUrl()}/convert-pdf-to-jpg`, {
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

      const contentType = resp.headers.get("Content-Type");

      if (contentType) {
        setRespContentType(contentType);
      }

      const fileName = `pdf-to-jpg-${getDateToFileConverted()}`;
      if (contentType?.includes(imageType)) {
        const blobFile = await resp.blob();
        setBlobFile(blobFile);
        // download a unique PDF
        downloadFile({
          fileName: `${fileName}.jpg`,
          blobFile: blobFile,
        });
      } else {
        // download as a zip with all converted images
        const buffer = await resp.arrayBuffer();
        setBufferFile(buffer);
        downloadZip(buffer, `${fileName}.zip`);
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
    const fileName = `pdf-to-jpg-${getDateToFileConverted()}`;

    if (respContentType.includes(imageType)) {
      if (!blobFile) {
        toast.error(ptJson.default_error_message);
        return;
      }
      downloadFile({
        fileName: `${fileName}.jpg`,
        blobFile: blobFile,
      });
    } else {
      if (!bufferFile) {
        toast.error(ptJson.default_error_message);
        return;
      }
      downloadZip(bufferFile, `${fileName}.zip`);
    }
  }

  function handleBackAction() {
    setMode(modeOptions.page);
    setFiles([]);
    setFinishedTask(false);
    setBlobFile(null);
  }

  return (
    <div className={pageMainSection}>
      {!loading && finishedTask && (
        <SuccessFinishedTask
          title={ptJson.convert_to_jpg_success}
          downloadButtonText={ptJson.download_images}
          backButton={ptJson.convert_more}
          onDownload={() => handleDownloadFile()}
          backAction={() => handleBackAction()}
        />
      )}

      {loading && (
        <MainFileLoading text={ptJson.convert_to_jpg_progress_text} />
      )}

      {!loading && !finishedTask && (
        <div>
          <PageIntroTitle
            title={ptJson.pdf_jpg}
            subtitle={ptJson.pdf_jpg_description}
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
              <p className="text-primary text-xl">
                {ptJson.click_or_drop_file}
              </p>
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
                  {ptJson.options}:
                </h3>

                <div className="mt-5 flex flex-col gap-3">
                  <label className={radioLabel}>
                    <input
                      type="radio"
                      name="compression-level"
                      value={modeOptions.page}
                      className={radioInput}
                      checked={mode === modeOptions.page}
                      onChange={() => setMode(modeOptions.page)}
                    />
                    <span className="w-full">
                      {ptJson.page_pdf_to_jpg_title} <br />
                      <span className={radioLabelTextInfo}>
                        {ptJson.page_pdf_to_jpg_description}
                      </span>
                    </span>
                  </label>

                  <div>
                    <label className={radioLabel}>
                      <input
                        type="radio"
                        name="compression-level"
                        value={modeOptions.extract}
                        className={radioInput}
                        checked={mode === modeOptions.extract}
                        onChange={() => setMode(modeOptions.extract)}
                      />
                      <span className="w-full">
                        {ptJson.extract_images} <br />
                        <span className={radioLabelTextInfo}>
                          {ptJson.extract_images_description}
                        </span>
                      </span>
                    </label>
                  </div>
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
            onAction={() => pdfToJpg()}
            label={ptJson.convert_to_jpg}
            loadingLabel={""}
          />
        </div>
      )}
    </div>
  );
}
