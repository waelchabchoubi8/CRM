import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import BASE_URL from '../Utilis/constantes';

const BasicTable = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isArticleDialogOpened, setArticleDialogOpened] = useState(false);
  const [newEmplacement, setNewEmplacement] = useState('');
  const [newRayon, setNewRayon] = useState('');

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/api/stockStore`, {
        params: {
          page,
          pageSize,
          codeArticle: searchTerm,
        },
      });

      console.log('API Response:', response.data);

      if (response.data && response.data.articles) {
        setArticles(response.data.articles);
        setTotal(response.data.total);
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Error fetching articles: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, pageSize, searchTerm]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const openArticleDialog = (article) => {
    setSelectedArticle(article);
    setNewEmplacement(article.EMPLACEMENT_ART || '');
    setNewRayon(article.RAYON_ARTICLE || '');
    setArticleDialogOpened(true);
  };

  const handleCloseArticleDialog = () => {
    setArticleDialogOpened(false);
  };

  const handleChangeEmplacement = (event) => {
    setNewEmplacement(event.target.value);
  };

  const handleChangeRayon = (event) => {
    setNewRayon(event.target.value);
  };

  const handleUpdateArticle = async () => {
    try {
      const articleId = selectedArticle.CODE_ARTICLE;
      const data = {
        EMPLACEMENT_ART: newEmplacement,
        RAYON_ARTICLE: newRayon
      };
      await axios.post(`${BASE_URL}/api/updateEmplacementMagasin/${articleId}`, data);
      setSelectedArticle({
        ...selectedArticle,
        EMPLACEMENT_ART: newEmplacement,
        RAYON_ARTICLE: newRayon
      });
      setArticleDialogOpened(false);
      alert('Article mis à jour avec succès');
      fetchArticles();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'article:', error);
      alert(`Échec de la mise à jour de l'article: ${error.message}`);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <SearchIcon />
        <TextField
          label="Rechercher un article"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          style={{ marginLeft: '10px' }}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Article</TableCell>
              <TableCell align="right">Code article</TableCell>
              <TableCell align="right">Emplacement</TableCell>
              <TableCell align="right">Rayon</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} align="center" style={{ color: 'red' }}>
                  {error}
                </TableCell>
              </TableRow>
            ) : articles.length > 0 ? (
              articles.map((article) => (
                <TableRow key={article.CODE_ARTICLE}>
                  <TableCell component="th" scope="row">
                    {article.INTIT_ARTICLE}
                  </TableCell>
                  <TableCell align="right">{article.CODE_ARTICLE}</TableCell>
                  <TableCell align="right">{article.EMPLACEMENT_ART}</TableCell>
                  <TableCell align="right">{article.RAYON_ARTICLE}</TableCell>
                  <TableCell align="right">{article.STOCK_PHYSIQUE}</TableCell>
                  <TableCell align="right">
                    <Button onClick={() => openArticleDialog(article)}>
                      <AddCircleIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">No articles found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={total}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog
        open={isArticleDialogOpened}
        onClose={handleCloseArticleDialog}
        PaperProps={{
          style: {
            backgroundColor: 'white',
            boxShadow: 'none',
            borderRadius: '10px',
          },
        }}
      >
        <DialogTitle style={{ backgroundColor: '#3572EF' }}>
          <Typography style={{ color: 'white', fontWeight: 'bold' }}>
            {selectedArticle?.CODE_ARTICLE} : {selectedArticle?.INTIT_ARTICLE}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <div>
              <TextField
                style={{ marginTop: 20 }}
                label="Rayon"
                value={newRayon}
                onChange={handleChangeRayon}
                variant="outlined"
                fullWidth
              />
              <p>Rayon actuel : {selectedArticle?.RAYON_ARTICLE || "Pas d'information sur le rayon."}</p>
              <TextField
                style={{ marginTop: 20 }}
                label="Emplacement"
                value={newEmplacement}
                onChange={handleChangeEmplacement}
                variant="outlined"
                fullWidth
              />
              <p>Emplacement actuel : {selectedArticle?.EMPLACEMENT_ART || "Pas d'information sur l'emplacement."}</p>
              <Typography style={{ color: 'black', fontSize: '1.2em', fontWeight: '20px' }}>
                <span style={{ color: 'black', fontWeight: 'bold', color: '#4379F2', marginBottom: '0.5em' }}>Stock actuel:</span> {selectedArticle?.STOCK_PHYSIQUE}
              </Typography>
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseArticleDialog}>Fermer</Button>
          <Button onClick={handleUpdateArticle} color="primary">Modifier</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BasicTable;
