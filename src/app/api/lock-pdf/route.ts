import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile";
import { writeFile, unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import path from "path";
import { PDFDocument } from "pdf-lib";

async function checkIfPdfIsEncrypted(fileBuffer: Buffer): Promise<boolean> {
  try {
    const pdfDoc = await PDFDocument.load(fileBuffer, {
      ignoreEncryption: true,
    });

    return pdfDoc.isEncrypted;
  } catch (error) {
    void error;
    return false;
  }
}

export async function POST(req: NextRequest) {
  const lockPdf = "lock_pdf";
  let tempPathToRemove;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const password = formData.get("password") as string;

    if (!file) {
      return NextResponse.json(
        { message: "required_pdf_to_lock" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { message: "only_pdf_is_allowed_to_lock" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();

    if (await checkIfPdfIsEncrypted(Buffer.from(bytes))) {
      return NextResponse.json(
        { message: "pdf_already_encrypted" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: "required_password_to_lock_pdf" },
        { status: 400 }
      );
    }

    if (password.length <= 2) {
      return NextResponse.json(
        { message: "password_min_3_caracteres" },
        { status: 400 }
      );
    }

    const iLovePdfPublicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const iLovePdfSecretKey = process.env.ILOVEPDF_SECRET_KEY;

    if (!iLovePdfPublicKey || !iLovePdfSecretKey) {
      return NextResponse.json(
        { message: `missing_ilovepdf_keys|${lockPdf}` },
        { status: 500 }
      );
    }

    const instance = new ILovePDFApi(iLovePdfPublicKey, iLovePdfSecretKey);
    const task = instance.newTask("protect");
    await task.start();
    const tempFileName = file.name;
    const tempPath = path.join(tmpdir(), tempFileName);
    tempPathToRemove = tempPath;
    await writeFile(tempPath, Buffer.from(bytes));
    const pdfFile = new ILovePDFFile(tempPath);
    await task.addFile(pdfFile);
    await task.process({
      password,
    });

    const data = await task.download();

    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="lock.pdf"`,
      },
    });
  } catch (err) {
    void err;
    return NextResponse.json(
      { message: `internal_server_erro|${lockPdf}` },
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
