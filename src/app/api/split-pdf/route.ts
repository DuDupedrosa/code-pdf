import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import AdmZip from "adm-zip";
import { HttpStatusEnum } from "../helpers/enums/errStatusEnum";

const splitPdf = "split_pdf";

const splitModeValues = {
  ranges: "ranges",
  remove_pages: "remove_pages",
};
const allowedSplitModeOptions = Object.values(splitModeValues);

export async function POST(req: NextRequest) {
  let tempPathToRemove;
  try {
    // Pegar o arquivo do FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const mergeAfter = formData.get("merge_after") as string;
    const splitMode = formData.get("split_mode") as string;
    const pagesRange = formData.get("pages_range") as string;

    if (!file) {
      return NextResponse.json(
        { message: "required_file_to_split" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { message: "file_must_be_pdf_to_split" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (!splitMode || !allowedSplitModeOptions.includes(splitMode)) {
      return NextResponse.json(
        { message: "invalid_split_mode_type" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (!pagesRange || pagesRange.length <= 0) {
      return NextResponse.json(
        { message: "invalid_page_ranges_type" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    // environments variables
    const iLovePdfPublicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const iLovePdfSecretKey = process.env.ILOVEPDF_SECRET_KEY;

    if (!iLovePdfPublicKey || !iLovePdfSecretKey) {
      return NextResponse.json(
        { message: `missing_ilovepdf_keys|${splitPdf}` },
        { status: HttpStatusEnum.INTERNAL_SERVER_ERROR }
      );
    }

    const instance = new ILovePDFApi(iLovePdfPublicKey, iLovePdfSecretKey);
    const task = instance.newTask("split");
    await task.start();
    const tempFileName = file.name;
    const tempPath = path.join(tmpdir(), tempFileName);
    tempPathToRemove = tempPath;
    const bytes = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(bytes));
    const pdfFile = new ILovePDFFile(tempPath);
    await task.addFile(pdfFile);

    if (splitMode === splitModeValues.ranges) {
      await task.process({
        split_mode: splitMode,
        ranges: pagesRange,
        merge_after: mergeAfter === "true",
      });
    } else {
      await task.process({
        ranges: pagesRange,
        remove_pages: pagesRange,
      });
    }

    const data = await task.download();

    if (mergeAfter === "false" && splitMode === splitModeValues.ranges) {
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
          "Content-Disposition": `attachment; filename="split.zip"`,
        },
      });
    } else {
      return new Response(data, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="split.pdf"`,
        },
      });
    }
  } catch (error) {
    void error;
    return NextResponse.json(
      { message: `internal_server_erro|${splitPdf}` },
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
