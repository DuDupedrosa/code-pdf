import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { tmpdir } from "os";

const compressPdf = `compress_pdf`;

export async function POST(req: NextRequest) {
  let tempPath = "";

  try {
    // Pegar o arquivo do FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "field_required" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { message: "field_must_be_pdf_to_compress" },
        { status: 400 }
      );
    }

    // environments variables
    const iLovePdfPublicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const iLovePdfSecretKey = process.env.ILOVEPDF_SECRET_KEY;

    if (!iLovePdfPublicKey || !iLovePdfSecretKey) {
      return NextResponse.json(
        { message: `missing_ilovepdf_keys|${compressPdf}` },
        { status: 500 }
      );
    }

    // Salvar temporariamente o arquivo no servidor
    tempPath = path.join(tmpdir(), file.name);
    const bytes = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(bytes));

    // iniciar a instance do ILovePdf
    const instance = new ILovePDFApi(iLovePdfPublicKey, iLovePdfSecretKey);
    const task = instance.newTask("compress");
    await task.start();

    const pdfFile = new ILovePDFFile(tempPath);
    await task.addFile(pdfFile);
    await task.process();
    const data = await task.download();

    return new Response(data, {
      headers: {
        "Content-Disposition": `attachment; filename=compressed-${file.name}`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    void error;
    return NextResponse.json({
      message: `internal_server_erro|${compressPdf}`,
    });
  } finally {
    // Garantir que o arquivo temporário seja removido
    if (tempPath) {
      try {
        await unlink(tempPath);
      } catch (unlinkError) {
        void unlinkError;
      }
    }
  }
}
