import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  RouteProps,
} from "react-router-dom";

import axios from 'axios';
import './App.css';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import { getToken } from './services/authService';

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { CRow, CCol, CSmartPagination } from '@coreui/react-pro';
import Search from './Search';
import ExportButton from './ExportButton';

import ThemeToggle from './Theme/ThemeToggle';

interface QueryResult {
  [key: string]: any;
}

interface DBSchema {
  schema: string;
  table: string;
}

interface TableProps {
  id: string;
  name: string;
}

const App: React.FC = () => {

  const [dbCredentials, setDbCredentials] = useState({
    host: '',
    user: '',
    password: '',
    database: '',
  });
  const [show, setShow] = useState(false);
  const [dbSchema, setDbSchema] = useState<DBSchema[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableProps[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(0);

  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [queryResult, setQueryResult] = useState<QueryResult[]>([]);
  const [error, setError] = useState<string>('');

  const PAGE_LIMIT = 5;

  const handleRunQuery = async () => {
    try {
      const response = await axios.post<{ result: QueryResult[] }>('http://localhost:5000/api/run-sql', { sqlQuery });
      setQueryResult(response.data.result);
      setError('');
    } catch (error) {
      setError('Failed to execute SQL query');
      console.error(error);
    }
  };

  useEffect(() => {
    setTotalPage(Math.ceil((selectedTable?.length ?? 0) / PAGE_LIMIT));
    setCurrentPage(1);
  }, [selectedTable]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setDbCredentials({ ...dbCredentials, [name]: value });
  };

  const handleTestConnection = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/test-connection', dbCredentials);
      alert(response.data.message);

    } catch (error: any) {
      alert(error.response.data.message);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/connect', dbCredentials);
      alert(response.data.message);
      console.log("DBdata", response.data.data)
      setDbSchema(response.data.data);
    } catch (error: any) {
      alert(error.response.data.message);
    }
  };

  const showModal = () => {
    setShow(true);
  };

  // Modal closing
  const closeModal = () => {
    setShow(false);
  };

  const handleTableClick = async (schema: any, table: any) => {
    const res = await axios.get(`http://localhost:5000/api/table/${schema}/${table}`);
    setSelectedTable(res.data);
  };
  const [theme, toggleTheme] = useState('light');

  console.log("@@@ test", theme);

  return (
    <div className="App">
      <ThemeToggle  theme={theme} toggleTheme={() => toggleTheme(theme === 'light' ? 'dark' : 'light')}/>
      <div style={{ background: theme === 'light' ? '#fff' : '#333', color: theme === 'light' ? '#333' : '#fff' }}>
        <button onClick={showModal}>Database Connection</button>
        {show && (
          <div className="modal">
            <div className="modal-content">
              <span className="close-button" onClick={closeModal}>&times;</span>
              <input type="text" name="host" placeholder="Host" onChange={handleInputChange} />
              <input type="text" name="user" placeholder="Username" onChange={handleInputChange} />
              <input type="password" name="password" placeholder="Password" onChange={handleInputChange} />
              <input type="text" name="database" placeholder="Database Name" onChange={handleInputChange} />
              <div>
                <button onClick={handleTestConnection}>Test Connection</button>
                <button onClick={handleConnect}>Connect</button>
              </div>
              <textarea value={sqlQuery} onChange={(e) => setSqlQuery(e.target.value)} />
              <button onClick={handleRunQuery}>Run Query</button>
              {error && <div>{error}</div>}
              {queryResult.length > 0 && (
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
                      {queryResult.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row).map((value, valueIndex) => (
                            <td key={valueIndex}>{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Search />
              <ExportButton />
              <SimpleTreeView>
                {dbSchema.map(schema => (
                  <TreeItem itemId={schema.schema} label={schema.schema}>
                    <TreeItem itemId={schema.table} label={schema.table} onClick={() => handleTableClick(schema.schema, schema.table)} />
                  </TreeItem>
                ))}
              </SimpleTreeView>
              { (selectedTable.length > 0) && 
                <div>
                  <h2>Table Data:</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTable.filter((_, i) => i >= PAGE_LIMIT * (currentPage - 1) && i < PAGE_LIMIT * currentPage).map(row => (
                        <tr key={row.id}>
                          <td>{row.id}</td>
                          <td>{row.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <CRow>
                    <CCol xs={6} md={6} xl={6}/>
                    <CCol xs={6} md={6} xl={6}>
                        <CSmartPagination
                            align="end"
                            activePage={currentPage}
                            pages={totalPage}
                            onActivePageChange={setCurrentPage}
                            size="sm"
                            limit={2}
                        />
                    </CCol>
                  </CRow>
                </div>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;