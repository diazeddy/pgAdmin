import React, { useState } from 'react';
import axios from 'axios';

const ExportButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/export?format=${format}`);
      // Handle the response, e.g., initiate download
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