import { NextRequest, NextResponse } from "next/server";
import { checkIfPdfIsEncrypted } from "../helpers/checkIfPdfIsEncrypted";
import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

export async function POST(req: NextRequest) {
  const unlockPdf = "unlock_pdf";
  let tempPathToRemove;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "required_pdf_to_unlock" },
        { status: 400 }
      );
    }

    if (file.type != "application/pdf") {
      return NextResponse.json(
        { message: "only_pdf_is_allowed_to_unlock" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const isEncrypted = await checkIfPdfIsEncrypted(Buffer.from(bytes));

    if (!isEncrypted) {
      return NextResponse.json(
        { message: "pdf_already_unlock" },
        { status: 400 }
      );
    }

    const iLovePdfPublicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const iLovePdfSecretKey = process.env.ILOVEPDF_SECRET_KEY;

    if (!iLovePdfPublicKey || !iLovePdfSecretKey) {
      return NextResponse.json(
        { message: `missing_ilovepdf_keys|${unlockPdf}` },
        { status: 500 }
      );
    }

    const instance = new ILovePDFApi(iLovePdfPublicKey, iLovePdfSecretKey);
    const task = instance.newTask("unlock");
    await task.start();
    const tempFileName = file.name;
    const tempPath = path.join(tmpdir(), tempFileName);
    tempPathToRemove = tempPath;
    await writeFile(tempPath, Buffer.from(bytes));
    const pdfFile = new ILovePDFFile(tempPath);
    await task.addFile(pdfFile);
    await task.process();

    const data = await task.download();

    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="unlock.pdf"`,
      },
    });
  } catch (err) {
    void err;
    return NextResponse.json(
      { message: `internal_server_erro|${unlockPdf}` },
      { status: 500 }
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
