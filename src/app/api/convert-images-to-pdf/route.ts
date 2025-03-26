import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import AdmZip from "adm-zip";

const convertImagesToPdf = "convert_images_to_pdf";

const orientationOptions = {
  portrait: "portrait",
  landscape: "landscape",
};

const marginOptions = {
  default: "default",
  small: "small",
  large: "large",
};

function imagesAreAllowed(files: File[]): boolean {
  const allowedTypes = ["image/jpeg", "image/png"];
  const imageNotAllowed = files.find(
    (file) => !allowedTypes.includes(file.type)
  );

  if (imageNotAllowed) return false;
  return true;
}

function getMarginValue(margin: string) {
  if (margin === marginOptions.small) {
    return 20;
  }

  if (margin === marginOptions.large) {
    return 25;
  }

  return 0;
}

function getOrientationValue(orientation: string) {
  if (orientation === orientationOptions.landscape) {
    return orientationOptions.landscape;
  }

  return orientationOptions.portrait;
}

export async function POST(req: NextRequest) {
  const tempPaths: string[] = [];

  try {
    // Pegar o arquivo do FormData
    const formData = await req.formData();
    const mergeAfter = formData.get("mergeAfter") as string | null;
    const orientation = formData.get("orientation") as string;
    const margin = formData.get("margin") as string;
    const images = formData.getAll("image") as File[];

    if (images.length === 0) {
      return NextResponse.json(
        { message: "select_image_to_continue" },
        { status: 400 }
      );
    }

    if (images.length > 4) {
      return NextResponse.json(
        { message: "you_can_process_4_files" },
        { status: 400 }
      );
    }

    if (!imagesAreAllowed(images)) {
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

    // iniciar a instance do ILovePdf
    const instance = new ILovePDFApi(iLovePdfPublicKey, iLovePdfSecretKey);
    const task = instance.newTask("imagepdf");
    await task.start();

    let count = 1;
    for (const image of images) {
      count++;
      const tempFileName = `${count}-${image.name}`;
      const tempPath = path.join(tmpdir(), tempFileName);
      tempPaths.push(tempPath);
      const bytes = await image.arrayBuffer();
      await writeFile(tempPath, Buffer.from(bytes));

      const pdfFile = new ILovePDFFile(tempPath);
      await task.addFile(pdfFile);
    }

    await task.process({
      pagesize: "A4",
      orientation: getOrientationValue(orientation),
      merge_after: mergeAfter === "true",
      margin: getMarginValue(margin),
    });

    const data = await task.download();

    // unique PDF
    if (mergeAfter === "true") {
      return new Response(data, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="image-converted.pdf"`,
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
          "Content-Disposition": `attachment; filename="file.zip"`,
        },
      });
    }
  } catch (error) {
    void error;
    return NextResponse.json(
      { message: `internal_server_erro|${convertImagesToPdf}` },
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
