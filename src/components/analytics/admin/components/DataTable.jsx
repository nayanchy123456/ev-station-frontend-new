import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import "../../../../css/adminAnalytics/dataTable.css";

const DataTable = ({ columns, data, onRowClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null) return 1;
      if (bVal === null) return -1;
      if (aVal === bVal) return 0;

      const multiplier = sortConfig.direction === "asc" ? 1 : -1;
      return aVal < bVal ? -1 * multiplier : 1 * multiplier;
    });
  }, [data, sortConfig]);

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => column.sortable !== false && handleSort(column.key)}
                className={column.sortable !== false ? "sortable" : ""}
              >
                <div className="th-content">
                  <span>{column.label}</span>
                  {column.sortable !== false && sortConfig.key === column.key && (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={index}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? "clickable" : ""}
            >
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {sortedData.length === 0 && (
        <div className="empty-state">
          <p>No data available</p>
        </div>
      )}
    </div>
  );
};

export default DataTable;
