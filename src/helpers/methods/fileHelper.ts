import { toast } from "sonner";
import ptJson from "@/translate/pt.json";

export const downloadFile = async ({
  fileName,
  resp,
  showToast = true,
}: {
  resp: Response;
  fileName: string;
  showToast?: boolean;
}) => {
  try {
    // resp = file encode
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    if (showToast) toast.success(ptJson.download_success);
  } catch (err) {
    void err;
    toast.error(ptJson.default_error_message);
  }
};

export const removeFileByIndex = (files: File[], indexToRemove: number) => {
  return files.filter((_, i) => i !== indexToRemove);
};
