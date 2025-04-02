import { NextRequest, NextResponse } from "next/server";
import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { HttpStatusEnum } from "../helpers/enums/errStatusEnum";

const filesMimeTypes = {
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const allowedTypes = Object.values(filesMimeTypes);

export async function POST(req: NextRequest) {
  const officePdf = "office_pdf";
  let tempPathToRemove;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "required_file_to_convert" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "invalid_file_type" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    const iLovePdfPublicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const iLovePdfSecretKey = process.env.ILOVEPDF_SECRET_KEY;
    if (!iLovePdfPublicKey || !iLovePdfSecretKey) {
      return NextResponse.json(
        { message: `missing_ilovepdf_keys|${officePdf}` },
        { status: HttpStatusEnum.INTERNAL_SERVER_ERROR }
      );
    }

    const instance = new ILovePDFApi(iLovePdfPublicKey, iLovePdfSecretKey);
    const task = instance.newTask("officepdf");
    await task.start();
    const tempFileName = file.name;
    const tempPath = path.join(tmpdir(), tempFileName);
    tempPathToRemove = tempPath;
    const bytes = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(bytes));
    const pdfFile = new ILovePDFFile(tempPath);
    await task.addFile(pdfFile);
    await task.process();

    const data = await task.download();

    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="office.pdf"`,
      },
    });
  } catch (err) {
    void err;
    return NextResponse.json(
      { message: `internal_server_erro|${officePdf}` },
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
