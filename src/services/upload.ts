import { API_HOST } from "../utils/static";

export const fazerUpload = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("access");

    const res = await fetch(`http://${API_HOST}:8000/api/acesso/upload-xls/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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