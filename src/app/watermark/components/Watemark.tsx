"use client";

import PageIntroTitle from "@/components/PageIntroTitle";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { getApiBaseUrl } from "@/helpers/methods/getApiBaseUrl";

const radioLabel =
  "label cursor-pointer whitespace-break-spaces flex items-start gap-2";
const radioInput = "radio radio-sm mt-1 checked:text-primary";

const verticalPositionValues = {
  bottom: "bottom",
  top: "top",
  middle: "middle",
};

const horizontalPositionValues = {
  left: "left",
  center: "center",
  right: "right",
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

const transparencyValues = {
  opacity_25: 25,
  opacity_50: 50,
  opacity_75: 75,
  opacity_100: 100,
};

const layerValues = {
  above: "above",
  below: "below",
};

const fontStylesValues = {
  normal: "Normal",
  bold: "Bold",
  italic: "Italic",
};

export default function WaterMark() {
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
  const [fontFamily, setFontFamily] = useState<string>(
    fontFamilyValues.arialUnicodeMs
  );
  const [fontSize, setFontSize] = useState<number>(fontSizeValues.sm);
  const [color, setColor] = useState("#000001");
  const [transparency, setTransparency] = useState<number>(
    transparencyValues.opacity_100
  );
  const [mosaic, setMosaic] = useState<"true" | "false">("false");
  const [layer, setLayer] = useState<string>(layerValues.above);
  const [text, setText] = useState<string>("");
  const [requiredText, setRequiredText] = useState<boolean>(false);
  const [fontStyle, setFontStyle] = useState<string>(fontStylesValues.normal);

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
    setRequiredText(false);
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

      if (!text || text.length <= 0) {
        setRequiredText(true);
        return;
      }

      setLoading(true);
      const startPageValue = startPage && startPage > 0 ? startPage : 1;
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("start_page", String(startPageValue));
      formData.append("vertical_position", verticalPosition);
      formData.append("horizontal_position", horizontalPosition);
      formData.append("font_family", fontFamily);
      formData.append("font_size", String(fontSize));
      formData.append("font_color", getHexadecimal(color));
      formData.append("font_style", fontStyle);
      formData.append("text", text);
      formData.append("transparency", String(transparency));
      formData.append("layer", layer);
      formData.append("mosaic", mosaic);
      formData.append("mode", "text");

      const resp = await fetch(`${getApiBaseUrl()}/watermark`, {
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
        fileName: `watermark-${getDateToFileConverted()}.pdf`,
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
        fileName: `watermark-${getDateToFileConverted()}.pdf`,
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
    setFontFamily(fontFamilyValues.arialUnicodeMs);
    setFontSize(fontSizeValues.sm);
    setColor("#000001");
    setFontStyle(fontStylesValues.normal);
    setMosaic("false");
    setTransparency(transparencyValues.opacity_100);
    setLayer(layerValues.above);
    setText("");
  }

  useEffect(() => {
    if (files.length <= 0) {
      setText("");
    }
  }, [files]);

  return (
    <div className={pageMainSection}>
      {!loading && finishedTask && (
        <SuccessFinishedTask
          title={ptJson.watermark_add_success}
          downloadButtonText={ptJson.download_pdf}
          backButton={ptJson.add_another_watermark_pdf}
          onDownload={() => handleDownloadFile()}
          backAction={() => handleBackAction()}
        />
      )}

      {loading && <MainFileLoading text={ptJson.add_watermark_pdf_progress} />}

      {!loading && !finishedTask && (
        <div>
          <PageIntroTitle
            title={ptJson.add_watermark_pdf}
            subtitle={ptJson.add_watermark_pdf_description}
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
                        <span className="w-full">{ptJson.insert_text}</span>
                      </label>

                      <label
                        className={`label cursor-not-allowed flex items-start gap-2`}
                      >
                        <input
                          type="radio"
                          className={`${radioInput} border-primary`}
                          disabled
                          readOnly
                        />
                        <span className="w-full cursor-not-allowed">
                          {ptJson.insert_image}
                        </span>
                        <div className="badge badge-xs badge-info">
                          {ptJson.coming_soon}
                        </div>
                      </label>
                    </div>

                    <div className="grid gap-2 mt-3">
                      <label
                        htmlFor="watermark-text"
                        className={`label ${requiredText ? "input-error" : ""}`}
                      >
                        {ptJson.text}
                      </label>
                      <input
                        id="watermark-text"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (requiredText && value && value.length > 0) {
                            setRequiredText(false);
                          }
                          setText(value);
                        }}
                        type="text"
                        className="input input-sm input-primary w-full"
                      />
                    </div>
                    {requiredText && (
                      <p className="text-xs text-error mt-2">
                        {ptJson.fill_required_field}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_1fr] my-3">
                    <div className="grid gap-2">
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

                    <div className="grid gap-2">
                      <label htmlFor="mosaic" className="label">
                        {ptJson.display_mode}
                      </label>
                      <select
                        value={mosaic}
                        onChange={(e) =>
                          setMosaic(
                            e.target.value === "true" ? "true" : "false"
                          )
                        }
                        id="mosaic"
                        className="select select-sm select-primary text-white cursor-pointer mr-6 w-full"
                      >
                        <option value={"true"}>
                          {ptJson.mosaic_position_description}
                        </option>
                        <option value={"false"}>
                          {ptJson.custom_position_description}
                        </option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="label" htmlFor="verticalPosition">
                        {ptJson.align_vertical}
                      </label>
                      <select
                        disabled={mosaic === "true"}
                        onChange={(e) => setVerticalPosition(e.target.value)}
                        id="verticalPosition"
                        value={verticalPosition}
                        className="select select-sm select-primary text-white cursor-pointer mr-6 w-full"
                      >
                        <option value={verticalPositionValues.bottom}>
                          {ptJson.align_pdf_bottom}
                        </option>
                        <option value={verticalPositionValues.middle}>
                          {ptJson.center}
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
                        disabled={mosaic === "true"}
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

                    <div className="grid gap-2">
                      <label htmlFor="transparency" className="label">
                        {ptJson.transparency}
                      </label>
                      <select
                        onChange={(e) =>
                          setTransparency(Number(e.target.value))
                        }
                        value={transparency}
                        id="transparency"
                        className="select select-sm select-primary text-white cursor-pointer mr-6 w-full"
                      >
                        <option value={transparencyValues.opacity_100}>
                          {transparencyValues.opacity_100}
                        </option>
                        <option value={transparencyValues.opacity_75}>
                          {transparencyValues.opacity_75}
                        </option>
                        <option value={transparencyValues.opacity_50}>
                          {transparencyValues.opacity_50}
                        </option>
                        <option value={transparencyValues.opacity_25}>
                          {transparencyValues.opacity_25}
                        </option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label htmlFor="layer" className="label">
                        {ptJson.view_layer}
                      </label>
                      <select
                        value={layer}
                        onChange={(e) => setLayer(e.target.value)}
                        id="layer"
                        className="select select-sm select-primary text-white cursor-pointer mr-6 w-full"
                      >
                        <option value={layerValues.above}>
                          {ptJson.above_content_description}
                        </option>
                        <option value={layerValues.below}>
                          {ptJson.below_content_description}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
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

                    <div className="grid gap-2">
                      <label htmlFor="fontStyle" className="label">
                        {ptJson.text_style}
                      </label>
                      <select
                        value={fontStyle}
                        onChange={(e) => setFontStyle(e.target.value)}
                        id="fontStyle"
                        className="select select-sm select-primary text-white w-full cursor-pointer mr-6"
                      >
                        {Object.values(fontStylesValues).map((style, i) => {
                          return (
                            <option value={style} key={i}>
                              {style}
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
            label={ptJson.add_watermark_pdf}
            loadingLabel={""}
          />
        </div>
      )}
    </div>
  );
}
