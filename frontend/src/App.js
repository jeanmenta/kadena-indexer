import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';

function App() {
  const [blockHashes, setBlockHashes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlockHashes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/block-hashes');
        setBlockHashes(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchBlockHashes();

    const interval = setInterval(fetchBlockHashes, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Kadena Block Hashes
        </Typography>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Kadena Block Hashes
        </Typography>
        <Typography variant="body1" color="error">
          Error fetching block hashes: {error.message}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Kadena Block Hashes
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Block Hash</TableCell>
              <TableCell>Fetched At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blockHashes.map((block, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{block.block_hash}</TableCell>
                <TableCell>{new Date(block.fetched_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default App;
