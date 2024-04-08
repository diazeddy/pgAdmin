import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardPage: React.FC = () => {

    const [dbInfo, setDbInfo] = useState<{ schemas: any[]; tables: any[] }>({ schemas: [], tables: [] });

    const [selectedTable, setSelectedTable] = useState<string>('');
    const [tableData, setTableData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [sqlQuery, setSqlQuery] = useState<string>('');
    const [sqlResult, setSqlResult] = useState<any[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);

    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        // Fetch DB schemas and tables data from the backend
        const fetchData = async () => {
          try {
            const response = await axios.get('http://localhost:5000/api/db-info');
            setDbInfo(response.data);
          } catch (error) {
            console.error('Error fetching DB info:', error);
          }
        };
    
        fetchData();
    }, []);


    useEffect(() => {
        // Fetch table data when selectedTable changes or currentPage changes
        const fetchTableData = async () => {
          if (selectedTable) {
            try {
              const response = await axios.get(`/api/table-data/${selectedTable}?page=${currentPage}`);
              setTableData(response.data.data);
              setTotalPages(Math.ceil(response.data.totalCount / 1000));
            } catch (error) {
              console.error(`Error fetching data for table ${selectedTable}:`, error);
            }
          }
        };
        fetchTableData();
    }, [selectedTable, currentPage]);


    const handleTableSelect = (tableName: string) => {
        setSelectedTable(tableName);
        setCurrentPage(1);
    }

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    }

    const handleRunSQL = async () => {
        try {
          const response = await axios.post('/api/run-sql', { sqlQuery });
          setSqlResult(response.data);
        } catch (error) {
          console.error('Error running SQL query:', error);
        }
    };

    const handleSearch = async () => {
        try {
          const response = await axios.get(`/api/search/${selectedTable}?query=${searchQuery}`);
          setTableData(response.data);
        } catch (error) {
          console.error(`Error searching data for table ${selectedTable}:`, error);
        }
    };

    return (
        <div>
            <h2>Dashboard</h2>
            <div>
                <h3>Schemas</h3>
                <ul>
                {dbInfo.schemas.map((schema) => (
                    <li key={schema.schema_name}>{schema.schema_name}</li>
                ))}
                </ul>
                <h3>Tables</h3>
                <ul>
                {dbInfo.tables.map((table) => (
                    <li key={`${table.table_schema}.${table.table_name}`} onClick={() => handleTableSelect(`${table.table_schema}.${table.table_name}`)}>
                    {`${table.table_schema}.${table.table_name}`}
                    </li>
                ))}
                </ul>
            </div>
            {selectedTable && (
                <div>
                    <h3>{selectedTable}</h3>
                    <div>
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        <button onClick={handleSearch}>Search</button>
                    </div>

                    <ul>
                        {tableData.map((row, index) => (
                        <li key={index}>{/* Render table row here */}</li>
                        ))}
                    </ul>
                    <div>
                        {Array.from({ length: totalPages }, (_, i) => (
                        <button key={i} onClick={() => handlePageChange(i + 1)}>
                            {i + 1}
                        </button>
                        ))}
                    </div>
                </div>
            )}
            <div>
                <button onClick={() => setShowModal(true)}>SQL Runner</button>
            </div>
            {showModal && (
                <div>
                    <textarea value={sqlQuery} onChange={(e) => setSqlQuery(e.target.value)} />
                    <button onClick={handleRunSQL}>Run SQL</button>
                    <ul>
                        {sqlResult.map((result, index) => (
                            <li key={index}>{/* Render SQL query result here */}</li>
                        ))}
                    </ul>
                    <button onClick={() => setShowModal(false)}>Close</button>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;