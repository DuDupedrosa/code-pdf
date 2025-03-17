"use client";

import PageIntroTitle from "@/components/PageIntroTitle";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import ptJson from "@/translate/pt.json";
import { format } from "date-fns";
import SelectedFile from "@/components/SelectedFile";
import ButtonActionFile from "@/components/ButtonActionFile";
import { downloadFile, removeFileByIndex } from "@/helpers/methods/fileHelper";
import { showFetchErroMessage } from "@/helpers/methods/fetchHelper";
import { pageMainSection } from "@/style/section";

export default function ConvertImagesToPdf() {
  const [images, setImages] = useState<File[] | []>([]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages(acceptedFiles);
  }, []);
  const [loading, setLoading] = useState<boolean>(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "image/jpg": [".jpg"], "image/png": [".png"] },
  });

  const convertImage = async () => {
    try {
      setLoading(true);
      if (!images || images.length <= 0) {
        toast.warning(ptJson.select_file_to_continue);
        return;
      }

      const formData = new FormData();
      formData.append("image", images[0]);

      const resp = await fetch("/api/convert-images-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        showFetchErroMessage(resp);
        return;
      }

      const formatDate = format(new Date(), "dd-MM-yy-HH:mm:ss");
      downloadFile({ fileName: `image-to-pdf-${formatDate}.pdf`, resp: resp });
      setImages([]);
    } catch (err) {
      void err;
      toast.error(ptJson.default_error_message);
    } finally {
      setLoading(false);
    }
  };

  function handleRemoveFile(index: number) {
    setImages(removeFileByIndex(images, index));
  }

  return (
    <div className={pageMainSection}>
      <PageIntroTitle
        title={ptJson.convert_img_to_pdf}
        subtitle={ptJson.convert_img_to_pdf_subtitle}
      />

      <div
        {...getRootProps()}
        className="border-2 md:max-w-1/2 mx-auto mt-8 border-dashed border-gray-400 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-primary text-xl">{ptJson.drop_img_spread}</p>
        ) : (
          <p className="text-primary text-xl">{ptJson.click_or_drop_img}</p>
        )}
      </div>

      {images && images.length > 0 && (
        <SelectedFile
          files={images}
          onRemoveFile={(index: number) => handleRemoveFile(index)}
        />
      )}

      <ButtonActionFile
        label={ptJson.convert_img}
        loadingLabel={ptJson.waiting_loading_your_img}
        loading={loading}
        onAction={() => convertImage()}
      />
    </div>
  );
}
