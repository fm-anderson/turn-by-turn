import React from "react";

interface TableDataProps {
  children: React.ReactNode;
  hideOnMobile?: boolean;
}

function TableData({ children, hideOnMobile }: TableDataProps) {
  const className = hideOnMobile ? " hidden md:block" : "";

  return <td className={className}>{children}</td>;
}

export default TableData;
