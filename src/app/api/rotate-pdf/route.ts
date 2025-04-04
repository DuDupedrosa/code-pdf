import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile";
import { writeFile, unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import path from "path";
import { HttpStatusEnum } from "../helpers/enums/errStatusEnum";

const rotateOptions = {
  rotate_0: 0,
  rotate_90: 90,
  rotate_180: 180,
  rotate_270: 270,
};

function getRotateValue(rotate: number): 0 | 90 | 180 | 270 | undefined {
  const literal = {
    [rotateOptions.rotate_0]: rotateOptions.rotate_0,
    [rotateOptions.rotate_90]: rotateOptions.rotate_90,
    [rotateOptions.rotate_180]: rotateOptions.rotate_180,
    [rotateOptions.rotate_270]: rotateOptions.rotate_270,
  } as Record<number, 0 | 90 | 180 | 270>;

  return literal[rotate];
}

const allowedRotateTypes = Object.values(rotateOptions);

export async function POST(req: NextRequest) {
  const rotatePdf = "rotate_pdf";
  let tempPathToRemove;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const rotate = formData.get("rotate") as string;

    if (!file) {
      return NextResponse.json(
        { message: "required_files" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { message: "only_pdf_is_allowed_to_rotate" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (!rotate || !allowedRotateTypes.includes(Number(rotate))) {
      return NextResponse.json(
        { message: "invalid_rotate_pdf_type" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    const iLovePdfPublicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const iLovePdfSecretKey = process.env.ILOVEPDF_SECRET_KEY;
    if (!iLovePdfPublicKey || !iLovePdfSecretKey) {
      return NextResponse.json(
        { message: `missing_ilovepdf_keys|${rotatePdf}` },
        { status: HttpStatusEnum.INTERNAL_SERVER_ERROR }
      );
    }

    const instance = new ILovePDFApi(iLovePdfPublicKey, iLovePdfSecretKey);
    const task = instance.newTask("rotate");
    await task.start();
    const tempFileName = file.name;
    const tempPath = path.join(tmpdir(), tempFileName);
    tempPathToRemove = tempPath;
    const bytes = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(bytes));
    const pdfFile = new ILovePDFFile(tempPath, {
      rotate: getRotateValue(Number(rotate)),
    });
    await task.addFile(pdfFile);
    await task.process();

    const data = await task.download();

    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rotated.pdf"`,
      },
    });
  } catch (err) {
    void err;
    return NextResponse.json(
      { message: `internal_server_erro|${rotatePdf}` },
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
