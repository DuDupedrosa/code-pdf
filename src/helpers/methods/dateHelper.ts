import { format } from "date-fns";

export const getDateToFileConverted = () => {
  return format(new Date(), "dd-MM-yy-HH:mm:ss");
};
