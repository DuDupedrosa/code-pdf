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

const pageTextValues = {
  page_n: "Página {n}",
  page_n_of_p: "Página {n} de {p}",
  page: "{n}",
};
const allowedTextOptions = Object.values(pageTextValues);

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

const fontSizeValues = {
  xs: 12,
  sm: 14,
  base: 16,
  large: 18,
  largeXl: 20,
};
const allowedFontSizeOptions = Object.values(fontSizeValues);

export async function POST(req: NextRequest) {
  const pageNumber = "page_number_pdf";
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

    if (!text || !allowedTextOptions.includes(text)) {
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

    if (!fontSize || !allowedFontSizeOptions.includes(Number(fontSize))) {
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

    const iLovePdfPublicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const iLovePdfSecretKey = process.env.ILOVEPDF_SECRET_KEY;
    if (!iLovePdfPublicKey || !iLovePdfSecretKey) {
      return NextResponse.json(
        { message: `missing_ilovepdf_keys|${pageNumber}` },
        { status: HttpStatusEnum.INTERNAL_SERVER_ERROR }
      );
    }

    const instance = new ILovePDFApi(iLovePdfPublicKey, iLovePdfSecretKey);
    const task = instance.newTask("pagenumber");
    await task.start();
    const tempFileName = file.name;
    const tempPath = path.join(tmpdir(), tempFileName);
    tempPathToRemove = tempPath;
    const bytes = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(bytes));
    const pdfFile = new ILovePDFFile(tempPath);
    await task.addFile(pdfFile);
    await task.process({
      vertical_position: verticalPosition,
      horizontal_position: horizontalPosition,
      text,
      font_family: fontFamily,
      font_size: Number(fontSize),
      font_color: fontColor,
      pages: `${startPage}-end`,
    });

    const data = await task.download();

    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="page-number.pdf"`,
      },
    });
  } catch (err) {
    void err;
    return NextResponse.json(
      { message: `internal_server_erro|${pageNumber}` },
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
