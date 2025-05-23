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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import MainFileLoading from "@/components/MainFileLoading";
import SuccessFinishedTask from "@/components/SuccessFinishedTask";
import MaxFilesTooltipInfo from "@/components/MaxFilesTooltipInfo";
import AlertErro from "@/components/AlertErro";
import { getDateToFileConverted } from "@/helpers/methods/dateHelper";
import { getApiBaseUrl } from "@/helpers/methods/getApiBaseUrl";

const orientationOptions = {
  portrait: "portrait",
  landscape: "landscape",
};

const marginOptions = {
  default: "default",
  small: "small",
  large: "large",
};

export default function ConvertImagesToPdf() {
  const [images, setImages] = useState<File[] | []>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [mergeAfter, setMergeAfter] = useState<boolean>(true);
  const [orientation, setOrientation] = useState<string>(
    orientationOptions.portrait
  );
  const [margin, setMargin] = useState<string>(marginOptions.default);
  const [finishedTask, setFinishedTask] = useState<boolean>(false);
  const [blobFile, setBlobFile] = useState<Blob | null>(null);
  const [bufferFile, setBufferFile] = useState<ArrayBuffer | null>(null);
  const toastShownRef = useRef(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setImages((prevImages) => {
        const totalFiles = [...prevImages, ...acceptedFiles].length;

        if (totalFiles > 4 && !toastShownRef.current) {
          toast.warning(ptJson.you_can_process_4_files, {
            position: "top-center",
          });
          toastShownRef.current = true;
          setTimeout(() => {
            toastShownRef.current = false;
          }, 2000);
        }

        return [...prevImages, ...acceptedFiles].slice(0, 4);
      });
    },
    [ptJson.you_can_process_4_files, setImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
  });

  const convertImage = async () => {
    setAlertMessage("");
    try {
      if (!images || images.length <= 0) {
        toast.warning(ptJson.select_file_to_continue, {
          position: "top-center",
        });
        return;
      }

      if (images.length > 4) {
        toast.warning(ptJson.you_can_process_4_files, {
          position: "top-center",
        });
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("mergeAfter", String(mergeAfter));
      formData.append("orientation", orientation);
      formData.append("margin", margin);
      images.forEach((image) => {
        formData.append("file", image);
      });

      const resp = await fetch(`${getApiBaseUrl()}/convert-images`, {
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

      const fileName = `image-to-pdf-${getDateToFileConverted()}`;

      if (mergeAfter) {
        const blobFile = await resp.blob();
        setBlobFile(blobFile);
        // download a unique PDF
        downloadFile({
          fileName: `${fileName}.pdf`,
          blobFile: blobFile,
        });
      } else {
        // download as a zip with all converted images
        const buffer = await resp.arrayBuffer();
        setBufferFile(buffer);
        downloadZip(buffer, `${fileName}.zip`);
      }

      setFinishedTask(true);
      setImages([]);
    } catch (err) {
      void err;
      setAlertMessage(ptJson.default_error_message_full);
    } finally {
      setLoading(false);
    }
  };

  function handleDownloadFile() {
    const formatDate = getDateToFileConverted();

    if (mergeAfter) {
      if (!blobFile) {
        toast.error(ptJson.default_error_message);
        return;
      }
      downloadFile({
        fileName: `image-to-pdf-${formatDate}.pdf`,
        blobFile: blobFile,
      });
    } else {
      if (!bufferFile) {
        toast.error(ptJson.default_error_message);
        return;
      }
      downloadZip(bufferFile, `images-to-pdf-${formatDate}.zip`);
    }
  }

  function handleBackAction() {
    setImages([]);
    setMergeAfter(true);
    setMargin(marginOptions.default);
    setOrientation(orientationOptions.portrait);
    setFinishedTask(false);
    setBlobFile(null);
    setBufferFile(null);
  }

  return (
    <div className={pageMainSection}>
      {loading && <MainFileLoading text={ptJson.converted_in_progress_text} />}

      {!loading && finishedTask && (
        <SuccessFinishedTask
          title={
            images && images.length > 1
              ? ptJson.success_converted_images
              : ptJson.success_converted_image
          }
          downloadButtonText={
            mergeAfter ? ptJson.download_pdf : ptJson.download_pdfs
          }
          backButton={ptJson.convert_more}
          onDownload={() => handleDownloadFile()}
          backAction={() => handleBackAction()}
        />
      )}

      {!loading && !finishedTask && (
        <div>
          <PageIntroTitle
            title={ptJson.convert_img_to_pdf}
            subtitle={ptJson.convert_img_to_pdf_subtitle}
          />

          <MaxFilesTooltipInfo />

          <div
            {...getRootProps()}
            className="border-2 md:max-w-1/2 mx-auto mt-2 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-primary text-xl">{ptJson.drop_img_spread}</p>
            ) : (
              <p className="text-primary text-xl">{ptJson.click_or_drop_img}</p>
            )}
          </div>

          {images && images.length > 0 && (
            <SelectedFile
              files={images}
              onChangeIndex={(files: File[]) => setImages(files)}
            />
          )}

          {images && images.length > 0 && (
            <div className="mt-5 md:max-w-1/2 mx-auto">
              <h3 className="text-lg font-semibold flex text-gray-50 items-center gap-2">
                <FontAwesomeIcon
                  icon={faGear}
                  className="text-gray-400 text-lg w-5 h-5"
                />
                {ptJson.settings}:
              </h3>

              {/* config section  */}
              <div className="mt-5 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="orientation" className="label">
                    {ptJson.page_orientation}
                  </label>
                  <select
                    defaultValue={orientation}
                    onChange={(e) => setOrientation(e.target.value)}
                    id="orientation"
                    className="select select-neutral cursor-pointer"
                  >
                    <option value={orientationOptions.portrait}>
                      {ptJson.portrait}
                    </option>
                    <option value={orientationOptions.landscape}>
                      {ptJson.landscape}
                    </option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="margin" className="label">
                    {ptJson.margin}
                  </label>
                  <select
                    defaultValue={margin}
                    onChange={(e) => setMargin(e.target.value)}
                    id="margin"
                    className="select select-neutral cursor-pointer"
                  >
                    <option value={marginOptions.default}>
                      {ptJson.no_margin}
                    </option>
                    <option value={marginOptions.small}>{ptJson.small}</option>
                    <option value={marginOptions.large}>{ptJson.large}</option>
                  </select>
                </div>

                {images.length > 1 && (
                  <div>
                    <label className="fieldset-label mt-5">
                      <input
                        type="checkbox"
                        onChange={(e) => setMergeAfter(e.target.checked)}
                        checked={mergeAfter}
                        className="checkbox checkbox-success"
                      />
                      {ptJson.joi_all_images_in_unique_pdf}
                    </label>
                  </div>
                )}
              </div>
            </div>
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
            label={ptJson.convert_to_pdf}
            loadingLabel={ptJson.waiting_loading_your_img}
            loading={loading}
            onAction={() => convertImage()}
          />
        </div>
      )}
    </div>
  );
}
