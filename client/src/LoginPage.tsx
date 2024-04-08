import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { getToken } from './services/authService';

const LoginPage : React.FC = () => {
    const navigate = useNavigate();
    const [host, setHost] = useState('');
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [database, setDatabase] = useState('');
    const [loading, setLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('');


    const handleTestConnection = async () => {
    setLoading(true);
    try {
        const response = await axios.post('http://localhost:5000/api/test-connection', { host, user, password, database });
        setConnectionStatus(response.data.message);
    } catch (error) {
        setConnectionStatus('Error: Unable to establish connection.');
    } finally {
        setLoading(false);
    }
    };

    const handleConnect = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/connect', { host, user, password, database });
            setConnectionStatus(response.data.message);
        } catch (error) {
            setConnectionStatus('Error: Unable to connect to the database.');
        } finally {
            setLoading(false);
        }
        localStorage.setItem('token', 'sampleToken');
    };

    useEffect(() => {
        const token = getToken();
        if (token) {
          // If token exists, user is authenticated, redirect to dashboard
          navigate('/dashboard');
        } else {
          setLoading(false);
        }
    }, [navigate]);

    

    return (
    <div>
        <h2>Login</h2>
        <input type="text" placeholder="Host" value={host} onChange={(e) => setHost(e.target.value)} />
        <input type="text" placeholder="User" value={user} onChange={(e) => setUser(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="text" placeholder="Database" value={database} onChange={(e) => setDatabase(e.target.value)} />
        <button onClick={handleTestConnection} disabled={loading}>Test Connection</button>
        <button onClick={handleConnect} disabled={loading}>Connect</button>
        {loading && <p>Loading...</p>}
        {connectionStatus && <p>{connectionStatus}</p>}
    </div>
    );
};

export default LoginPage;