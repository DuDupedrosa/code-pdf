import { toast } from "sonner";
import ptJson from "@/translate/pt.json";

export const downloadFile = async ({
  fileName,
  blobFile,
}: {
  fileName: string;
  blobFile: Blob;
}) => {
  try {
    // resp = file encode
    const blob = blobFile;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success(ptJson.download_success);
  } catch (err) {
    void err;
    toast.error(ptJson.default_error_message);
  }
};

export const removeFileByIndex = (files: File[], indexToRemove: number) => {
  return files.filter((_, i) => i !== indexToRemove);
};

export function downloadZip(buffer: ArrayBuffer, fileName = "file.zip") {
  try {
    const blob = new Blob([buffer], { type: "application/zip" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
    toast.success(ptJson.download_success);
  } catch (err) {
    void err;
    toast.error(ptJson.default_error_message);
  }
}
