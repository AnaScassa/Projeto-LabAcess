import { useState, useEffect } from "react";

export function useAuth() {
  const [username, setUsername] = useState<string | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("username");
    setUsername(user);
    setIsStaff(localStorage.getItem("is_staff") === "true");
    setIsSuperuser(localStorage.getItem("is_superuser") === "true");
  }, []);

  return { username, isAdmin: isStaff && isSuperuser };
}