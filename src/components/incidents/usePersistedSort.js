import { useState } from 'react';

export default function usePersistedSort() {
  const [sortColumn, setCol] = useState('');
  const [sortDirection, setDir] = useState('asc');

  const toggleSort = (col) => {
    if (col === sortColumn) {
      setDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setCol(col);
      setDir('asc');
    }
  };

  return { 
    sortColumn, 
    sortDirection, 
    toggleSort, 
    setSortColumn : setCol, 
    setSortDirection : setDir
  };
}