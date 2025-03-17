import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { tmpdir } from "os";

const convertImagesToPdf = "convert_images_to_pdf";

export async function POST(req: NextRequest) {
  let tempPath = "";

  try {
    // Pegar o arquivo do FormData
    const formData = await req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json(
        { message: "image_required_to_convert" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { message: "only_jpeg_or_png_image_allowed_to_convert" },
        { status: 400 }
      );
    }

    // environments variables
    const iLovePdfPublicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const iLovePdfSecretKey = process.env.ILOVEPDF_SECRET_KEY;

    if (!iLovePdfPublicKey || !iLovePdfSecretKey) {
      return NextResponse.json(
        { message: `missing_ilovepdf_keys|${convertImagesToPdf}` },
        { status: 500 }
      );
    }

    // Salvar temporariamente o arquivo no servidor
    tempPath = path.join(tmpdir(), image.name);
    const bytes = await image.arrayBuffer();
    await writeFile(tempPath, Buffer.from(bytes));

    // iniciar a instance do ILovePdf
    const instance = new ILovePDFApi(iLovePdfPublicKey, iLovePdfSecretKey);
    const task = instance.newTask("imagepdf");
    await task.start();

    const pdfFile = new ILovePDFFile(tempPath);
    await task.addFile(pdfFile);
    await task.process({ pagesize: "A4" });
    const data = await task.download();

    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="image-converted-to-pdf.pdf"`,
      },
    });
  } catch (error) {
    void error;
    return NextResponse.json({
      message: `internal_server_erro|${convertImagesToPdf}`,
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
