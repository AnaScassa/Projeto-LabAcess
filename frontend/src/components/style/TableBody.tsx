import type { ReactNode } from "react";

interface TableBodyProps<T> {
  data: T[];
  hasData?: boolean;
  colSpan: number;
  emptyMessage: string;
  renderRow: (item: T, index: number) => ReactNode;
  loading?: boolean;
  loadingMessage?: string;
}

export default function TableBody<T>({
  data,
  hasData = data.length > 0,
  colSpan,
  emptyMessage,
  renderRow,
  loading = false,
  loadingMessage = "Carregando dados...",
}: TableBodyProps<T>) {
  return (
    <tbody>
      {loading ? (
        <tr>
          <td colSpan={colSpan} className="px-4 py-4 text-center text-secondary">
            <div className="spinner-border spinner-border-sm me-2 mr-1" role="status" aria-hidden="true"></div>
            {loadingMessage}
          </td>
        </tr>
      ) : !hasData ? (
        <tr>
          <td colSpan={colSpan} className="px-4 py-4 text-center text-secondary">{emptyMessage}</td>
        </tr>
      ) : (
        data.map(renderRow)
      )}
    </tbody>
  );
}
