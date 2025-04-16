import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { HttpStatusEnum } from "../helpers/enums/errStatusEnum";

export async function POST(req: NextRequest) {
  const tempPaths: string[] = [];
  const mergePdf = "merge_pdf";
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length <= 0) {
      return NextResponse.json(
        { message: "required_files" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (files.length === 1) {
      return NextResponse.json(
        { message: "require_min_2_pdf_to_merge" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    if (files.length > 2) {
      return NextResponse.json(
        { message: "you_can_process_2_files" },
        { status: HttpStatusEnum.BAD_REQUEST }
      );
    }

    // environments variables
    const iLovePdfPublicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const iLovePdfSecretKey = process.env.ILOVEPDF_SECRET_KEY;
    if (!iLovePdfPublicKey || !iLovePdfSecretKey) {
      return NextResponse.json(
        { message: `missing_ilovepdf_keys|${mergePdf}` },
        { status: HttpStatusEnum.INTERNAL_SERVER_ERROR }
      );
    }

    // iniciar a instance do ILovePdf
    const instance = new ILovePDFApi(iLovePdfPublicKey, iLovePdfSecretKey);
    const task = instance.newTask("merge");
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

    await task.process();

    const data = await task.download();

    return new Response(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="merge.pdf"`,
      },
    });
  } catch (error) {
    void error;
    return NextResponse.json(
      { message: `internal_server_erro|${mergePdf}` },
      { status: HttpStatusEnum.INTERNAL_SERVER_ERROR }
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
