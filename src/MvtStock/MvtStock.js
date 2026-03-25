import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  TableContainer,
  Pagination,
  TextField,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import BASE_URL from "../Utilis/constantes";

const StyledTable = styled(TableContainer)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  marginTop: theme.spacing(2),
  "& .MuiTableHead-root": {
    backgroundColor: "#3572EF",
    "& .MuiTableCell-head": {
      color: "white",
      fontWeight: "bold",
    },
  },
  "& .MuiTableRow-root:hover": {
    backgroundColor: "rgba(118, 149, 255, 0.05)",
  },
}));

export default function ArticleMovementsDialog({ open, onClose, codeArticle }) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
const [page, setPage] = useState(1);
const pageSize = 10;
const [totalPages, setTotalPages] = useState(1);
const fetchCommands = async (pageValue = page) => {
  if (!codeArticle?.CODE_ARTICLE) return;

  setLoading(true);
  try {
    const url = `${BASE_URL}/api/getLastCmdByArticle` +
      `?article=${encodeURIComponent(codeArticle.CODE_ARTICLE)}` +
      `&page=${pageValue}` +
      `&pageSize=${pageSize}`;

    const res = await fetch(url); // GET by default
    const data = await res.json();

    setRows(data.data || []);
    setTotalPages(data.totalPages || 1);
  } catch (err) {
    console.error("Erreur chargement commandes article:", err);
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  if (open) setPage(1);
}, [open, codeArticle]);

useEffect(() => {
  if (open && codeArticle?.CODE_ARTICLE) {
    fetchCommands(page);
  }
}, [open, codeArticle, page]);


const columns = [
  { header: "Num Commande", field: "NUM_CDE_C" },
  { header: "Adresse 1", field: "ADR_C_C_1" },
  { header: "Adresse 2", field: "ADR_C_C_2" },
  { header: "Date Commande", field: "DATE_CDE_C" },
  { header: "Quantité", field: "CCL_QTE_C" },
];




  



  return (

     <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl"
      PaperProps={{
      sx: {
        width: "90%",      
        maxHeight: "80vh", 
        minHeight: "400px", 
      },
  }}>
<DialogTitle sx={{ fontWeight: 600 }}>
  Commandes BCI pour l'article {codeArticle?.CODE_ARTICLE} (dernier 15 jours)
</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>

           <Box sx={{ py: 1  , display: "flex", justifyContent: "flex-start" }}>
           
          </Box>
            <StyledTable component={Paper}>
              <Table>
                <TableHead>             
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell key={col.field}>{col.header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
  {rows.length === 0 ? (
    <TableRow>
      <TableCell colSpan={columns.length} align="center">
        Aucun mouvement trouvé
      </TableCell>
    </TableRow>
  ) : (
    rows.map((row, index) => (
      <TableRow key={index}>
        {columns.map((col) => (
          <TableCell key={col.field}>
            {col.field === "DATE_CDE_C" && row[col.field]
  ? new Date(row[col.field]).toLocaleDateString()
  : row[col.field] ?? "-"}

          </TableCell>
        ))}
      </TableRow>
    ))
  )}
</TableBody>

              </Table>
            </StyledTable>

            {totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Page {page} sur {totalPages}
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
