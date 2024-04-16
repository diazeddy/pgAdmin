import React, { useState } from 'react';
import axios from 'axios';
import { DBSchema } from './App';
interface SearchResult {
  id: number | string;
  name: string;
}


const Search: React.FC<DBSchema> = ({ schema, table }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string>('');

  const handleSearch = async () => {
    try {
      /*

      implement react code to get tablename and schemaname

      */
      const response = await axios.post<SearchResult[]>(`${process.env.REACT_APP_API_SEARCH}?query=${searchQuery}&schema=${schema}&table=${table}`);
      setSearchResults(response.data);
      setError('');
    } catch (error) {
      setError('Failed to perform search');
      console.error(error);
    }
  };

  return (
    <div className="search-container">
      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." />
      <button onClick={handleSearch}>Search</button>
      {error && <div>{error}</div>}
      {searchResults.length > 0 && (
        <div>
          <h2>Search Results:</h2>
          <ul>
            {searchResults.map(result => (
              <li key={result.id}>{result.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Search;