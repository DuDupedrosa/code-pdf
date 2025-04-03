import { NextRequest, NextResponse } from "next/server";
import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { HttpStatusEnum } from "../helpers/enums/errStatusEnum";
import AdmZip from "adm-zip";

const modeOptions = {
  page: "pages",
  extract: "extract",
};

const allowedModeOptions = Object.values(modeOptions);
const imageType = "image/jpeg";
const zipType = "application/zip";
const zipMagicNumber = "80 75 3 4";
const jpgMagicNumber = ["255 216 255 224", "255 216 255 225"];

export async function POST(req: NextRequest) {
  const pdfJpg = "pdf_to_jpg";
  let tempPathToRemove;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const mode = formData.get("mode") as string;

    if (!file) {
      return NextResponse.json(
        { message: "required_file_to_convert" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (file.type != "application/pdf") {
      return NextResponse.json(
        { message: "only_pdf_is_allowed_to_convert_jpg" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (!mode || !allowedModeOptions.includes(mode)) {
      return NextResponse.json(
        { message: "invalid_mode_type_pdf_to_jpg" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    const iLovePdfPublicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const iLovePdfSecretKey = process.env.ILOVEPDF_SECRET_KEY;
    if (!iLovePdfPublicKey || !iLovePdfSecretKey) {
      return NextResponse.json(
        { message: `missing_ilovepdf_keys|${pdfJpg}` },
        { status: HttpStatusEnum.INTERNAL_SERVER_ERROR }
      );
    }

    const instance = new ILovePDFApi(iLovePdfPublicKey, iLovePdfSecretKey);
    const task = instance.newTask("pdfjpg");
    await task.start();
    const tempFileName = file.name;
    const tempPath = path.join(tmpdir(), tempFileName);
    tempPathToRemove = tempPath;
    const bytes = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(bytes));
    const pdfFile = new ILovePDFFile(tempPath);
    await task.addFile(pdfFile);
    await task.process({ pdfjpg_mode: mode });

    const data = await task.download();
    // Converter para Uint8Array caso seja um ArrayBuffer
    const uint8Array =
      data instanceof ArrayBuffer ? new Uint8Array(data) : data;
    // Pegar os primeiros 4 bytes para verificar o tipo do arquivo
    const signature = uint8Array.slice(0, 4).join(" ");

    if (jpgMagicNumber.includes(signature)) {
      return new Response(data, {
        headers: {
          "Content-Type": imageType,
          "Content-Disposition": `attachment; filename="pdf-to-jpg.jpg"`,
        },
      });
    }

    if (signature === zipMagicNumber) {
      const zip = new AdmZip(Buffer.from(data));
      const newZip = new AdmZip();

      zip.getEntries().forEach((entry) => {
        if (!entry.isDirectory && entry.entryName.endsWith(".jpg")) {
          const fileName = path.basename(entry.entryName);
          newZip.addFile(fileName, entry.getData());
        }
      });

      const cleanedZipBuffer = newZip.toBuffer();

      return new Response(cleanedZipBuffer, {
        headers: {
          "Content-Type": zipType,
          "Content-Disposition": `attachment; filename="pdf-to-jpg.zip"`,
        },
      });
    }

    return NextResponse.json(
      { message: "service_unavailable" },
      { status: HttpStatusEnum.SERVICE_UNAVAILABLE }
    );
  } catch (err) {
    void err;
    return NextResponse.json(
      { message: `internal_server_erro|${pdfJpg}` },
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
