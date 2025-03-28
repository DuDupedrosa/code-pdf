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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faGear,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import MainFileLoading from "@/components/MainFileLoading";
import AlertErro from "@/components/AlertErro";

export default function Lock() {
  const [files, setFiles] = useState<File[] | []>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [finishedTask, setFinishedTask] = useState<boolean>(false);
  const [blobFile, setBlobFile] = useState<Blob | null>(null);
  const toastShownRef = useRef(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [requiredPassword, setRequiredPassword] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

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
    accept: { "application/pdf": [".pdf"] },
  });

  const lockFile = async () => {
    setAlertMessage("");
    try {
      if (!files || files.length <= 0) {
        toast.warning(ptJson.select_file_to_continue, {
          position: "top-center",
        });
        return;
      }

      if (!password || password.length <= 0) {
        setRequiredPassword(true);
        return;
      }

      if (password.length <= 2) {
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
      formData.append("password", password);

      const resp = await fetch("/api/lock-pdf", {
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

      const formatDate = format(new Date(), "dd-MM-yy-HH:mm:ss");
      const blobFile = await resp.blob();
      setBlobFile(blobFile);
      downloadFile({
        fileName: `lock-pdf-${formatDate}.pdf`,
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
    const formatDate = format(new Date(), "dd-MM-yy-HH:mm:ss");
    if (!blobFile) {
      toast.error(ptJson.default_error_message);
      return;
    }

    if (blobFile) {
      downloadFile({
        fileName: `lock-pdf-${formatDate}.pdf`,
        blobFile: blobFile,
      });
    }
  }

  function handleBackAction() {
    setFiles([]);
    setPassword("");
    setFinishedTask(false);
    setBlobFile(null);
  }

  return (
    <div className={pageMainSection}>
      {!loading && finishedTask && (
        <SuccessFinishedTask
          title={ptJson.locked_pdf_success}
          downloadButtonText={ptJson.download_pdf}
          backButton={ptJson.lock_another_pdf}
          onDownload={() => handleDownloadFile()}
          backAction={() => handleBackAction()}
        />
      )}

      {loading && <MainFileLoading text={ptJson.lock_progress_text} />}

      {!loading && !finishedTask && (
        <div>
          <PageIntroTitle
            title={ptJson.lock_pdf}
            subtitle={ptJson.lock_pdf_description}
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
                files={files}
                onChangeIndex={(newFiles: File[]) => setFiles(newFiles)}
              />

              <div className="mt-5 md:max-w-1/2 mx-auto">
                <h3 className="text-lg font-semibold flex text-gray-50 items-center gap-2">
                  <FontAwesomeIcon
                    icon={faGear}
                    className="text-gray-400 text-lg w-5 h-5"
                  />
                  {ptJson.password_to_pdf}:
                </h3>

                <label
                  className={`w-full md:w-xs ${
                    requiredPassword ? "input-error" : ""
                  } input outline-offset-1 validator mt-5`}
                >
                  <FontAwesomeIcon
                    icon={faKey}
                    className="text-gray-400 text-sm"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={ptJson.password}
                    minLength={3}
                    value={password}
                    pattern=".{3,}"
                    title={ptJson.password_min_3_caracteres}
                    onChange={(e) => {
                      if (e.target.value && requiredPassword) {
                        setRequiredPassword(false);
                      }

                      setPassword(e.target.value);
                    }}
                  />

                  {!showPassword && (
                    <FontAwesomeIcon
                      onClick={() => setShowPassword(!showPassword)}
                      icon={faEye}
                      className="text-gray-400 text-sm cursor-pointer transition-all hover:text-gray-200"
                    />
                  )}
                  {showPassword && (
                    <FontAwesomeIcon
                      onClick={() => setShowPassword(!showPassword)}
                      icon={faEyeSlash}
                      className="text-gray-400 text-sm cursor-pointer transition-all hover:text-gray-200"
                    />
                  )}
                </label>
                {requiredPassword && (
                  <p className="text-xs text-error mt-2">
                    {ptJson.fill_required_field}
                  </p>
                )}

                <p className="validator-hint hidden">
                  {ptJson.password_min_3_caracteres}
                </p>
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
            onAction={() => lockFile()}
            label={ptJson.lock_pdf_single}
            loadingLabel={""}
          />
        </div>
      )}
    </div>
  );
}
