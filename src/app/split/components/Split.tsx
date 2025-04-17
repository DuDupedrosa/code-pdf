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
  "label cursor-pointer whitespace-break-spaces flex items-start gap-2";
const radioInput = "radio radio-sm mt-1 checked:text-primary";

const splitModeValues = {
  ranges: "ranges",
  remove_pages: "remove_pages",
};

export default function Split() {
  const [files, setFiles] = useState<File[] | []>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [finishedTask, setFinishedTask] = useState<boolean>(false);
  const [blobFile, setBlobFile] = useState<Blob | null>(null);
  const toastShownRef = useRef(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [splitMode, setSplitMode] = useState<string>(splitModeValues.ranges);
  const [pagesRange, setPageRange] = useState<string>("");
  const [mergeAfter, setMergeAfter] = useState<boolean>(true);
  const [requiredField, setRequiredField] = useState<boolean>(false);
  const [bufferFile, setBufferFile] = useState<ArrayBuffer | null>(null);

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

  const wordToPdf = async () => {
    setAlertMessage("");
    setRequiredField(false);
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

      if (!pagesRange || pagesRange.length <= 0) {
        setRequiredField(true);
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("split_mode", splitMode);
      formData.append("merge_after", String(mergeAfter));
      formData.append("pages_range", pagesRange);

      const resp = await fetch(`${getApiBaseUrl()}/split`, {
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

      const fileName = `split-${getDateToFileConverted()}`;
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
      setFiles([]);
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
        fileName: `split-${formatDate}.pdf`,
        blobFile: blobFile,
      });
    } else {
      if (!bufferFile) {
        toast.error(ptJson.default_error_message);
        return;
      }
      downloadZip(bufferFile, `split-${formatDate}.zip`);
    }
  }

  function handleBackAction() {
    setFiles([]);
    setFinishedTask(false);
    setBlobFile(null);
    setBufferFile(null);
    setPageRange("");
    setSplitMode(splitModeValues.ranges);
  }

  return (
    <div className={pageMainSection}>
      {!loading && finishedTask && (
        <SuccessFinishedTask
          title={ptJson.split_pdf_success}
          downloadButtonText={
            !mergeAfter && splitMode === splitModeValues.ranges
              ? ptJson.download_pdfs
              : ptJson.download_pdf
          }
          backButton={ptJson.split_another_pdf}
          onDownload={() => handleDownloadFile()}
          backAction={() => handleBackAction()}
        />
      )}

      {loading && <MainFileLoading text={ptJson.split_pdf_progress} />}

      {!loading && !finishedTask && (
        <div>
          <PageIntroTitle
            title={ptJson.split_pdf}
            subtitle={ptJson.split_pdf_description}
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
                <div className="mt-5">
                  <div className="flex flex-col md:flex-row gap-5 md:items-center">
                    <label className={radioLabel}>
                      <input
                        value={splitModeValues.ranges}
                        checked={splitMode === splitModeValues.ranges}
                        onChange={(e) => setSplitMode(e.target.value)}
                        type="radio"
                        className={radioInput}
                      />
                      <span className="w-full">
                        {ptJson.split_page_interval_title}
                      </span>
                    </label>

                    <label className={radioLabel}>
                      <input
                        value={splitModeValues.remove_pages}
                        checked={splitMode === splitModeValues.remove_pages}
                        onChange={(e) => setSplitMode(e.target.value)}
                        type="radio"
                        className={radioInput}
                      />
                      <span className="w-full">
                        {ptJson.remove_pages_title}
                      </span>
                    </label>
                  </div>

                  <div>
                    <div
                      role="alert"
                      className="alert alert-info alert-outline mb-5 mt-8"
                    >
                      {splitMode === splitModeValues.ranges && (
                        <span>
                          Informe os intervalos de páginas que deseja extrair.
                          Você pode usar:
                          <br />• <strong>Vírgula</strong> para separar páginas
                          ou intervalos diferentes (<code>1,3,5-7</code>)<br />•{" "}
                          <strong>Hífen</strong> para definir um intervalo de
                          páginas (<code>2-4</code>)
                          <br />
                          <br />
                          Cada intervalo será extraído. Você poderá escolher se
                          quer gerar um PDF separado para cada um ou unir tudo
                          em um único arquivo.
                        </span>
                      )}
                      {splitMode === splitModeValues.remove_pages && (
                        <span>
                          Informe as páginas que deseja remover do PDF. Utilize:
                          <br />• <strong>Vírgula</strong> para separar páginas
                          ou intervalos diferentes (<code>1,2,4-6</code>)<br />•{" "}
                          <strong>Hífen</strong> para definir um intervalo de
                          páginas (<code>8-10</code>)
                          <br />
                          <br />
                          As páginas informadas serão excluídas do arquivo
                          final.
                        </span>
                      )}
                    </div>

                    <div className="grid gap-1">
                      <label htmlFor="pagesRange">{ptJson.pages}</label>
                      <input
                        value={pagesRange}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (requiredField && value && value.length > 0) {
                            setRequiredField(false);
                          }
                          setPageRange(value);
                        }}
                        type="text"
                        id="pagesRange"
                        className="input input-primary input-sm w-full"
                      />
                      <small className="text-xs text-muted">
                        {ptJson.example}: <code>1,3,5-7</code>
                      </small>
                      {requiredField && (
                        <p className="text-xs text-error mt-2">
                          {ptJson.fill_required_field}
                        </p>
                      )}
                    </div>

                    {splitMode === splitModeValues.ranges && (
                      <div className="mt-3">
                        <label className="fieldset-label mt-5">
                          <input
                            type="checkbox"
                            onChange={(e) => setMergeAfter(e.target.checked)}
                            checked={mergeAfter}
                            className="checkbox checkbox-success checkbox-sm"
                          />
                          {ptJson.merge_unique_pdf}
                        </label>
                      </div>
                    )}
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
            onAction={() => wordToPdf()}
            label={ptJson.split_pdf}
            loadingLabel={""}
          />
        </div>
      )}
    </div>
  );
}
