import React, { useState } from 'react';
import axios from 'axios';
import { DBSchema } from './App';

const ExportButton: React.FC<DBSchema> = ({ schema, table }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/export?format=${format}&schema=${schema}&table=${table}`);

      // Create hidden link to download CSV
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = `data:text/csv;charset=utf-8,${encodeURI(response.data)}`;
      link.target = '_blank';
      link.download = 'data.csv';

      // Append link and click it
      document.body.appendChild(link);
      link.click();

      // Remove link from body
      document.body.removeChild(link);

    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleExport('csv')} disabled={loading}>Export as CSV</button>
      <button onClick={() => handleExport('sql')} disabled={loading}>Export as SQL</button>
    </div>
  );
};

export default ExportButton;