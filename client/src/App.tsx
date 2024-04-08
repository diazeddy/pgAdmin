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

  const PAGE_LIMIT = 5;

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



  return (
    <div className="App">
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
                {/* <div>
                  <ul className="pagination">
                  {Array.from({ length: Math.ceil(selectedTable.length / itemsPerPage) }, (_, index) => index).map(number => (
                      <li key={number} className="page-item">
                        <button onClick={() => paginate(number + 1)} className="page-link">
                          {number + 1}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div> */}
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default App;