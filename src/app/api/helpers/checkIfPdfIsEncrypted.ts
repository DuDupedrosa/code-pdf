import { PDFDocument } from "pdf-lib";

export async function checkIfPdfIsEncrypted(
  fileBuffer: Buffer
): Promise<boolean> {
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
