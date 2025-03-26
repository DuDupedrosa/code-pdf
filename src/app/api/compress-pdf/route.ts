import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import AdmZip from "adm-zip";

const compressPdf = `compress_pdf`;

function allowedCompressionLevels(level: string) {
  const levels = ["extreme", "recommended", "low"];

  return levels.includes(level);
}

function filesAreAllowed(files: File[]): boolean {
  const allowedTypes = ["application/pdf"];
  const fileNotAllowed = files.find(
    (file) => !allowedTypes.includes(file.type)
  );

  if (fileNotAllowed) return false;
  return true;
}

export async function POST(req: NextRequest) {
  const tempPaths: string[] = [];

  try {
    // Pegar o arquivo do FormData
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    const compressionLevel = formData.get("compressionLevel") as string;

    if (!files || files.length <= 0) {
      return NextResponse.json(
        { message: "select_file_to_continue" },
        { status: 400 }
      );
    }

    if (!filesAreAllowed(files)) {
      return NextResponse.json(
        { message: "field_must_be_pdf_to_compress" },
        { status: 400 }
      );
    }

    if (files.length > 2) {
      return NextResponse.json(
        { message: "you_can_process_2_files" },
        { status: 400 }
      );
    }

    if (!compressionLevel || !allowedCompressionLevels(compressionLevel)) {
      return NextResponse.json(
        { message: "invalid_compression_level" },
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

    // iniciar a instance do ILovePdf
    const instance = new ILovePDFApi(iLovePdfPublicKey, iLovePdfSecretKey);
    const task = instance.newTask("compress");
    await task.start();

    let count = 1;
    for (const file of files) {
      count++;
      const tempFileName = `${count}-${file.name}`;
      const tempPath = path.join(tmpdir(), tempFileName);
      tempPaths.push(tempPath);
      const bytes = await file.arrayBuffer();
      await writeFile(tempPath, Buffer.from(bytes));

      const pdfFile = new ILovePDFFile(tempPath);
      await task.addFile(pdfFile);
    }

    await task.process({ compression_level: compressionLevel });
    const data = await task.download();

    // unique PDF
    if (files.length === 1) {
      return new Response(data, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="file-compressed.pdf"`,
        },
      });
    } else {
      // zip with all converted PDF
      const zip = new AdmZip(Buffer.from(data));
      const newZip = new AdmZip();

      zip.getEntries().forEach((entry) => {
        if (!entry.isDirectory && entry.entryName.endsWith(".pdf")) {
          const fileName = path.basename(entry.entryName);
          newZip.addFile(fileName, entry.getData());
        }
      });

      const cleanedZipBuffer = newZip.toBuffer();

      return new Response(cleanedZipBuffer, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="file-compressed.zip"`,
        },
      });
    }
  } catch (error) {
    void error;
    return NextResponse.json(
      { message: `internal_server_erro|${compressPdf}` },
      { status: 500 }
    );
  } finally {
    for (const tempPath of tempPaths) {
      try {
        await unlink(tempPath);
      } catch (unlinkError) {
        void unlinkError;
      }
    }
  }
}
