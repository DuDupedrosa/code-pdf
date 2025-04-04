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
import SuccessFinishedTask from "@/components/SuccessFinishedTask";
import MaxFilesTooltipInfo from "@/components/MaxFilesTooltipInfo";
import MainFileLoading from "@/components/MainFileLoading";
import AlertErro from "@/components/AlertErro";
import { getDateToFileConverted } from "@/helpers/methods/dateHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faRotateLeft,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

const rotateOptions = {
  rotate_0: 0,
  rotate_90: 90,
  rotate_180: 180,
  rotate_270: 270,
};

const rotateButton =
  "px-4 py-2 btn bg-gray-700 text-white rounded hover:bg-gray-600 transition border border-gray-500";
const rotateButtonIcon = "mr-2 text-primary";

export default function RotatePdf() {
  const [files, setFiles] = useState<File[] | []>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [finishedTask, setFinishedTask] = useState<boolean>(false);
  const [blobFile, setBlobFile] = useState<Blob | null>(null);
  const toastShownRef = useRef(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [rotate, setRotate] = useState<number>(rotateOptions.rotate_0);

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

  const rotatePdf = async () => {
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
      formData.append("rotate", String(rotate));

      const resp = await fetch("/api/rotate-pdf", {
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
      // download a unique PDF
      downloadFile({
        fileName: `rotate-${rotate}-${getDateToFileConverted()}.pdf`,
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
      fileName: `rotate-${rotate}-${getDateToFileConverted()}.pdf`,
      blobFile: blobFile,
    });
  }

  function handleBackAction() {
    setRotate(rotateOptions.rotate_0);
    setFiles([]);
    setFinishedTask(false);
    setBlobFile(null);
  }

  function handleRotateLeft() {
    setRotate((prev) => (prev === 0 ? 270 : prev - 90));
  }

  function handleRotateRight() {
    setRotate((prev) => (prev === 270 ? 0 : prev + 90));
  }

  return (
    <div className={pageMainSection}>
      {!loading && finishedTask && (
        <SuccessFinishedTask
          title={ptJson.rotate_pdf_success}
          downloadButtonText={ptJson.download_pdf}
          backButton={ptJson.rotate_more}
          onDownload={() => handleDownloadFile()}
          backAction={() => handleBackAction()}
        />
      )}

      {loading && <MainFileLoading text={ptJson.rotate_pdf_progress} />}

      {!loading && !finishedTask && (
        <div>
          <PageIntroTitle
            title={ptJson.rotate_pdf}
            subtitle={ptJson.rotate_pdf_description}
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

                <div className="mt-4 flex flex-col items-center gap-4">
                  <div
                    className="w-52 md:w-56 h-72 md:h-80 bg-white shadow-md flex items-center justify-center transition-transform duration-300"
                    style={{ transform: `rotate(${rotate}deg)` }}
                  >
                    <span className="text-gray-700 font-semibold text-center">
                      {ptJson.example_pdf_visible}
                    </span>
                  </div>

                  {/* Botões de rotação */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <button onClick={handleRotateLeft} className={rotateButton}>
                      <FontAwesomeIcon
                        icon={faRotateLeft}
                        className={rotateButtonIcon}
                      />
                      {ptJson.turn_left}
                    </button>
                    <button
                      onClick={handleRotateRight}
                      className={rotateButton}
                    >
                      <FontAwesomeIcon
                        icon={faRotateRight}
                        className={rotateButtonIcon}
                      />
                      {ptJson.turn_right}
                    </button>
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
            onAction={() => rotatePdf()}
            label={ptJson.rotate_pdf}
            loadingLabel={""}
          />
        </div>
      )}
    </div>
  );
}
