import { cn } from '@/lib/utils';

interface DataTableProps<TData, TColumn> {
  data: TData[];
  columns: TColumn[];
  className?: string;
}

export function DataTable<TData, TColumn>({ 
  data, 
  columns, 
  className 
}: DataTableProps<TData, TColumn>) {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {(columns as any[]).map((col: any, idx) => (
              <th 
                key={idx} 
                className="h-10 px-4 text-left align-middle font-medium text-muted-foreground"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="border-b transition-colors hover:bg-muted/50">
              {(columns as any[]).map((col: any, colIdx) => (
                <td key={colIdx} className="p-4 align-middle">
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
