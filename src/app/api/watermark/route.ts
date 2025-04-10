import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile";
import { writeFile, unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import path from "path";
import { HttpStatusEnum } from "../helpers/enums/errStatusEnum";

const verticalPositionValues = {
  bottom: "bottom",
  top: "top",
  middle: "middle",
};
const allowedVerticalPositionOptions = Object.values(verticalPositionValues);

const horizontalPositionValues = {
  left: "left",
  center: "center",
  right: "right",
};
const allowedHorizontalPositionOptions = Object.values(
  horizontalPositionValues
);

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
const allowedFontFamilyOptions = Object.values(fontFamilyValues);

const fontStylesValues = {
  normal: "Normal",
  bold: "Bold",
  italic: "Italic",
};
const allowedFontStylesOptions = Object.values(fontStylesValues);

const layerValues = {
  above: "above",
  below: "below",
};
const allowedLayerOptions = Object.values(layerValues);

const modeValues = {
  text: "text",
  image: "image",
};
const allowedModeOptions = Object.values(modeValues);

export async function POST(req: NextRequest) {
  const watermark = "watermark";
  let tempPathToRemove;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const startPage = formData.get("start_page") as string;
    const verticalPosition = formData.get("vertical_position") as string;
    const horizontalPosition = formData.get("horizontal_position") as string;
    const text = formData.get("text") as string;
    const fontFamily = formData.get("font_family") as string;
    const fontSize = formData.get("font_size") as string;
    const fontColor = formData.get("font_color") as string;
    const fontStyle = formData.get("font_style") as string;
    const transparency = formData.get("transparency") as string;
    const layer = formData.get("layer") as string;
    const mosaic = formData.get("mosaic") as string;
    const mode = formData.get("mode") as string;

    if (!file) {
      return NextResponse.json(
        { message: "select_file_to_continue" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { message: "only_pdf_accepted" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (!startPage || Number(startPage) <= 0) {
      return NextResponse.json(
        { message: "invalid_starting_number" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (
      !verticalPosition ||
      !allowedVerticalPositionOptions.includes(verticalPosition)
    ) {
      return NextResponse.json(
        { message: "invalid_vertical_position" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (
      !horizontalPosition ||
      !allowedHorizontalPositionOptions.includes(horizontalPosition)
    ) {
      return NextResponse.json(
        { message: "invalid_horizontal_position" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (!text || text.length <= 0 || typeof text !== "string") {
      return NextResponse.json(
        { message: "invalid_text" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (!fontFamily || !allowedFontFamilyOptions.includes(fontFamily)) {
      return NextResponse.json(
        { message: "invalid_font_family" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (!fontSize || Number(fontSize) <= 0) {
      return NextResponse.json(
        { message: "invalid_font_size" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (!fontColor) {
      return NextResponse.json(
        { message: "invalid_font_color" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (!fontStyle || !allowedFontStylesOptions.includes(fontStyle)) {
      return NextResponse.json(
        { message: "invalid_font_style" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (!transparency || Number(transparency) <= 0) {
      return NextResponse.json(
        { message: "invalid_transparency_type" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (!layer || !allowedLayerOptions.includes(layer)) {
      return NextResponse.json(
        { message: "invalid_layer_type" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (!mode || !allowedModeOptions.includes(mode)) {
      return NextResponse.json(
        { message: "invalid_mode_option" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    const iLovePdfPublicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const iLovePdfSecretKey = process.env.ILOVEPDF_SECRET_KEY;
    if (!iLovePdfPublicKey || !iLovePdfSecretKey) {
      return NextResponse.json(
        { message: `missing_ilovepdf_keys|${watermark}` },
        { status: HttpStatusEnum.INTERNAL_SERVER_ERROR }
      );
    }

    const instance = new ILovePDFApi(iLovePdfPublicKey, iLovePdfSecretKey);
    const task = instance.newTask("watermark");
    await task.start();
    const tempFileName = file.name;
    const tempPath = path.join(tmpdir(), tempFileName);
    tempPathToRemove = tempPath;
    const bytes = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(bytes));
    const pdfFile = new ILovePDFFile(tempPath);
    await task.addFile(pdfFile);
    await task.process({
      pages: `${startPage}-end`,
      vertical_position: verticalPosition,
      horizontal_position: horizontalPosition,
      text,
      font_family: fontFamily,
      font_size: Number(fontSize),
      font_color: fontColor,
      font_style: fontStyle === fontStylesValues.normal ? null : fontStyle,
      transparency: Number(transparency),
      layer,
      mosaic: mosaic === "true",
      mode,
    });

    const data = await task.download();

    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="watermark.pdf"`,
      },
    });
  } catch (err) {
    void err;
    return NextResponse.json(
      { message: `internal_server_erro|${watermark}` },
      { status: HttpStatusEnum.INTERNAL_SERVER_ERROR }
    );
  } finally {
    try {
      if (tempPathToRemove) {
        await unlink(tempPathToRemove);
      }
    } catch (unlinkError) {
      void unlinkError;
    }
  }
}
