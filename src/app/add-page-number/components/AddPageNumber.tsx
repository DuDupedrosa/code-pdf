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
import { faGear } from "@fortawesome/free-solid-svg-icons";

const radioLabel =
  "label cursor-pointer whitespace-break-spaces flex items-start gap-2";
const radioInput = "radio radio-sm mt-1 checked:text-primary";

const verticalPositionValues = {
  bottom: "bottom",
  top: "top",
};

const horizontalPositionValues = {
  left: "left",
  center: "center",
  right: "right",
};

const pageTextValues = {
  page_n: "Página {n}",
  page_n_of_p: "Página {n} de {p}",
  page: "{n}",
};

const fontFamilyValues = {
  arial: "Arial",
  arialUnicodeMs: "Arial Unicode MS",
  verdana: "Verdana",
  courier: "Courier",
  timesNewRoman: "Times New Roman",
  comicSansMs: "Comic Sans MS",
  wenQuanYiZenHei: "WenQuanYi Zen Hei",
  lohitMarathi: "Lohit Marathi",
};

const fontSizeValues = {
  xs: 12,
  sm: 14,
  base: 16,
  large: 18,
  largeXl: 20,
};

export default function AddPageNumber() {
  const [files, setFiles] = useState<File[] | []>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [finishedTask, setFinishedTask] = useState<boolean>(false);
  const [blobFile, setBlobFile] = useState<Blob | null>(null);
  const toastShownRef = useRef(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [startPage, setStartPage] = useState<number | undefined>(1);
  const [verticalPosition, setVerticalPosition] = useState<string>(
    verticalPositionValues.bottom
  );
  const [horizontalPosition, setHorizontalPosition] = useState<string>(
    horizontalPositionValues.right
  );
  const [pageText, setPageText] = useState<string>(pageTextValues.page);
  const [fontFamily, setFontFamily] = useState<string>(
    fontFamilyValues.arialUnicodeMs
  );
  const [fontSize, setFontSize] = useState<number>(fontSizeValues.sm);
  const [color, setColor] = useState("#000001");
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

  function getHexadecimal(color: string): string {
    const ctx = document.createElement("canvas").getContext("2d");

    if (!ctx) return "#000000"; // fallback se canvas falhar

    ctx.fillStyle = color;

    // pega o valor computado (sempre será no formato #rrggbb se possível)
    return ctx.fillStyle;
  }

  const wordToPdf = async () => {
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
      const startPageValue = startPage && startPage > 0 ? startPage : 1;
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("start_page", String(startPageValue));
      formData.append("vertical_position", verticalPosition);
      formData.append("horizontal_position", horizontalPosition);
      formData.append("text", pageText);
      formData.append("font_family", fontFamily);
      formData.append("font_size", String(fontSize));
      formData.append("font_color", getHexadecimal(color));

      const resp = await fetch("/api/add-page-number", {
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
        fileName: `paged-number-${getDateToFileConverted()}.pdf`,
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

    if (blobFile) {
      downloadFile({
        fileName: `paged-number-${getDateToFileConverted()}.pdf`,
        blobFile: blobFile,
      });
    }
  }

  function handleBackAction() {
    setFiles([]);
    setFinishedTask(false);
    setBlobFile(null);
    setStartPage(1);
    setVerticalPosition(verticalPositionValues.bottom);
    setHorizontalPosition(horizontalPositionValues.right);
    setPageText(pageTextValues.page);
    setFontFamily(fontFamilyValues.arialUnicodeMs);
    setFontSize(fontSizeValues.sm);
    setColor("#000001");
  }

  return (
    <div className={pageMainSection}>
      {!loading && finishedTask && (
        <SuccessFinishedTask
          title={ptJson.add_page_number_success}
          downloadButtonText={ptJson.download_pdf}
          backButton={ptJson.add_another_page_number_pdf}
          onDownload={() => handleDownloadFile()}
          backAction={() => handleBackAction()}
        />
      )}

      {loading && <MainFileLoading text={ptJson.add_page_number_progress} />}

      {!loading && !finishedTask && (
        <div>
          <PageIntroTitle
            title={ptJson.add_page_number_pdf}
            subtitle={ptJson.add_page_number_pdf_description}
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
                  <div className="mb-5">
                    <div className="flex gap-5 items-center">
                      <label className={radioLabel}>
                        <input
                          type="radio"
                          className={radioInput}
                          checked={true}
                          readOnly
                        />
                        <span className="w-full">{ptJson.unique_page}</span>
                      </label>

                      <label
                        className={`label cursor-not-allowed flex items-start gap-2`}
                      >
                        <input
                          type="radio"
                          className={`${radioInput} border-primary`}
                          disabled
                        />
                        <span className="w-full">{ptJson.double_page}</span>
                        <div className="badge badge-xs badge-info">
                          {ptJson.coming_soon}
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-2 mb-3">
                    <label htmlFor="startPage" className="label">
                      {ptJson.start_page}
                    </label>
                    <input
                      id="startPage"
                      value={startPage}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const numericValue = Number(rawValue);

                        if (rawValue === "") {
                          setStartPage(undefined);
                        } else if (numericValue < 1) {
                          setStartPage(1);
                        } else {
                          setStartPage(numericValue);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (["-", "e", "E"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className="input input-sm input-primary w-full"
                      type="number"
                      min="1"
                      placeholder="Ex: 1"
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_1fr] my-3">
                    <div className="grid gap-2">
                      <label className="label" htmlFor="verticalPosition">
                        {ptJson.align_vertical}
                      </label>
                      <select
                        onChange={(e) => setVerticalPosition(e.target.value)}
                        id="verticalPosition"
                        value={verticalPosition}
                        className="select select-sm select-primary text-white cursor-pointer mr-6 w-full"
                      >
                        <option value={verticalPositionValues.bottom}>
                          {ptJson.align_pdf_bottom}
                        </option>
                        <option value={verticalPositionValues.top}>
                          {ptJson.align_pdf_top}
                        </option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="horizontalPosition" className="label">
                        {ptJson.horizontal_position}
                      </label>
                      <select
                        onChange={(e) => setHorizontalPosition(e.target.value)}
                        value={horizontalPosition}
                        id="horizontalPosition"
                        className="select select-sm select-primary text-white cursor-pointer mr-6 w-full"
                      >
                        <option value={horizontalPositionValues.left}>
                          {ptJson.left_pdf}
                        </option>
                        <option value={horizontalPositionValues.center}>
                          {ptJson.center}
                        </option>
                        <option value={horizontalPositionValues.right}>
                          {ptJson.right_pdf}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
                    <div className="grid gap-2">
                      <label htmlFor="pageText" className="label">
                        {ptJson.text_format_pdf}
                      </label>
                      <select
                        onChange={(e) => setPageText(e.target.value)}
                        value={pageText}
                        id="pageText"
                        className="select select-sm select-primary text-white w-full cursor-pointer mr-6"
                      >
                        <option value={pageTextValues.page_n}>
                          {ptJson.page_n}
                        </option>
                        <option value={pageTextValues.page_n_of_p}>
                          {ptJson.page_n_of_p}
                        </option>
                        <option value={pageTextValues.page}>
                          {ptJson.only_page_number}
                        </option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="fontFamily" className="label">
                        {ptJson.font}
                      </label>
                      <select
                        id="fontFamily"
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="select select-sm select-primary text-white w-full cursor-pointer mr-6"
                      >
                        {Object.values(fontFamilyValues).map((family, i) => {
                          return (
                            <option key={i} value={family}>
                              {family}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="fontSize" className="label">
                        {ptJson.text_size}
                      </label>
                      <select
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        id="fontSize"
                        className="select select-sm select-primary text-white w-full cursor-pointer mr-6"
                      >
                        {Object.values(fontSizeValues).map((size, i) => {
                          return (
                            <option value={size} key={i}>
                              {size}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="grid gap-2 w-64">
                      <label htmlFor="fontColor" className="text-white">
                        {ptJson.color}
                      </label>

                      <div className="relative h-8 rounded border border-primary bg-neutral-800 p-[6px]">
                        <input
                          id="fontColor"
                          type="color"
                          value={color}
                          onChange={(e) => {
                            console.log("Cor selecionada:", e.target.value);
                            setColor(e.target.value);
                          }}
                          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                          className="w-full h-full rounded"
                          style={{
                            backgroundColor: color,
                            pointerEvents: "none",
                          }}
                        />
                      </div>
                    </div>
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
            label={ptJson.add_pages}
            loadingLabel={""}
          />
        </div>
      )}
    </div>
  );
}
