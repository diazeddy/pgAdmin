import React, { useState } from 'react';
import axios from 'axios';

interface QueryResult {
    [key: string]: any;
  }
  
  interface SqlRunnerProps {
    onClose: () => void;
  }

const SqlRunner: React.FC<SqlRunnerProps> = ({ onClose }) => {
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [queryResult, setQueryResult] = useState<QueryResult[]>([]);
  const [error, setError] = useState<string>('');

  const handleRunQuery = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/run-sql', { sqlQuery });
      setQueryResult(response.data.result);
      setError('');
    } catch (error) {
      setError('Failed to execute SQL query');
      console.error(error);
    }
  };

  return (
    <div>
      <textarea value={sqlQuery} onChange={(e) => setSqlQuery(e.target.value)} />
      <button onClick={handleRunQuery}>Run Query</button>
      {error && <div>{error}</div>}
      {queryResult && (
        <div>
          <h2>Query Result:</h2>
          <table>
            <thead>
              <tr>
                {Object.keys(queryResult[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queryResult.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, index) => (
                    <td key={index}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default SqlRunner;