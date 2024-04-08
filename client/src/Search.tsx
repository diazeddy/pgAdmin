import React, { useState } from 'react';
import axios from 'axios';

interface SearchResult {
  id: number | string;
  name: string;
}

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string>('');

  const handleSearch = async () => {
    try {
      const response = await axios.post<SearchResult[]>(`http://localhost:5000/api/search?query=${searchQuery}`);
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