import ptJson from "@/translate/pt.json";
import { toast } from "sonner";
import { ErrStatusEnum } from "../enums/errStatusEnum";

export const showFetchErroMessage = async (resp: Response) => {
  try {
    const errData: { message: string } = await resp.json();
    let toastMessage = ptJson.default_error_message;

    if (resp.status === ErrStatusEnum.BAD_REQUEST) {
      const errMessage = errData.message as keyof typeof ptJson;

      if (errMessage && ptJson[errMessage]) {
        toastMessage = ptJson[errMessage];
      }
    }

    toast.error(toastMessage);
  } catch (err) {
    void err;
    toast.error(ptJson.default_error_message);
  }
};
