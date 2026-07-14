import { API_HOST } from "../utils/static";
import { authFetch } from "./auth";

export const fazerUpload = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await authFetch(`http://${API_HOST}:8000/api/acesso/upload-xls/`, {
        method: "POST",
        body: formData,
      });

    if (!res || !res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};