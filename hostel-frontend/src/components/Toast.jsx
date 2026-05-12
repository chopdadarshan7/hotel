import { useAuth } from "../lib/AuthContext";

export default function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;

  return (
    <div className={`toast toast--${toast.type}`}>
      {toast.message}
    </div>
  );
}
