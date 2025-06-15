import React from "react";

interface TableDataProps {
  children: string;
}

function TableData({ children }: React.PropsWithChildren<TableDataProps>) {
  return <td>{children}</td>;
}

export default TableData;
