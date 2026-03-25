// src/pages/ArticlesNoMovementPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../Utilis/constantes';
import {
  Container,
  Typography,
  Box,
  TextField,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';


function ArticlesNoMovementPage() {
  const [days, setDays] = useState(25);
  const [page, setPage] = useState(0);   
  const [pageSize, setPageSize] = useState(25);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!days || days <= 0) return;

    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        `${API_BASE_URL}/api/articles-no-movement`,
        {
          params: {
            days,
            page,
            pageSize,
          },
        }
      );

      setRows(response.data.articles || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error(err);
      setError(
        (err.response && err.response.data && err.response.data.error) ||
          'Erreur lors du chargement des données'
      );
    } finally {
      setLoading(false);
    }
  };

  // Reload when days / page / pageSize change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, page, pageSize]);

  const handleDaysChange = (event) => {
    const value = event.target.value;
    const num = Number(value);

    setPage(0); // reset to first page when filter changes

    if (!value) {
      setDays('');
      return;
    }

    if (!isNaN(num) && num > 0) {
      setDays(num);
    }
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAlertClick = (row) => {
    // TODO: implement backend call later
    console.log('Alerter Commercial pour:', row.CODE_ARTICLE, row.INTIT_ARTICLE);
    alert(`(TODO) Alerter le commercial pour l'article ${row.CODE_ARTICLE}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Title */}
      <Typography variant="h4" component="h1" gutterBottom>
        Articles Non Mouvementés
      </Typography>

      {/* Filter bar */}
      <Box
        component={Paper}
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          label="Nombre de jours"
          type="number"
          size="small"
          value={days}
          onChange={handleDaysChange}
          InputProps={{ inputProps: { min: 1 } }}
        />
      </Box>

      {error && (
        <Box mb={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {/* Table */}
      <Paper elevation={3}>
        {loading ? (
          <Box
            sx={{
              p: 4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code article</TableCell>
                  <TableCell>Libellé article</TableCell>
                  <TableCell>Dernier mouvement</TableCell>
                  <TableCell>Jours sans mouvement</TableCell>
                  <TableCell>Stock actuel</TableCell>
                  {/* <TableCell align="center">Action</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucun article trouvé.
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((row, index) => (
                  <TableRow key={`${row.CODE_ARTICLE}-${index}`}>
                    <TableCell>{row.CODE_ARTICLE}</TableCell>
                    <TableCell>{row.INTIT_ARTICLE}</TableCell>
                    <TableCell>{row.LAST_MVT_DATE}</TableCell>
                    <TableCell>{row.DAYS_SINCE_LAST_MOVEMENT}</TableCell>
                    <TableCell>{row.CURRENT_STOCK}</TableCell>
                    {/* <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAlertClick(row)}
                      >
                        Alerter Commercial
                      </Button>
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Lignes par page"
            />
          </>
        )}
      </Paper>
    </Container>
  );
}

export default ArticlesNoMovementPage;
