import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import BASE_URL from "../Utilis/constantes";

/* =========================
   Print cell style helper
========================= */
const tdStyle = {
  border: "1px solid #000",
  padding: 4,
};

export default function MouvementsByDate() {
  /* =========================
     🔹 States
  ========================= */
  const [schema, setSchema] = useState("cspd");
  const [date, setDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );

  const [data, setData] = useState([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  /* =========================
     📡 Fetch paginated data
  ========================= */
  const fetchMouvements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/mouvements-by-date`,
        {
          params: {
            schema,
            date,
            page,
            pageSize,
          },
        }
      );

      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("fetchMouvements error:", err);
      setSnackbar({
        open: true,
        message:
          err.response?.data?.details ||
          "Erreur lors du chargement des mouvements",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     🖨️ Print ALL data
  ========================= */
  const handlePrint = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/mouvements-by-date`,
      {
        params: {
          schema,
          date,
          page: 0,
          pageSize: 100000,
        },
      }
    );

    const rows = res.data.data || [];

    if (rows.length === 0) {
      window.alert("Aucune donnée à imprimer.");
      return;
    }

    // Generate table rows including STOCK
    const rowsHtml = rows.map((row) => `
      <tr>
        <td>${row.NUMERO || ""}</td>
        <td>${row.ARTICLE || ""}</td>
        <td>${row.DESIGNATION || ""}</td>
        <td style="text-align:right;">${row.QTE ?? ""}</td>
        <td style="text-align:right;">${row.STOCK ?? ""}</td>
      </tr>
    `).join("");

    const stockHeader = schema === "cspd" ? "Stock CSPD" : "Stock FDM";

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Mouvements – ${schema.toUpperCase()} – ${date}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h2 {
              text-align: center;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #333;
              padding: 6px;
            }
            th {
              background-color: #1976d2;
              color: white;
              text-align: left;
            }
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h2>Mouvements – ${schema.toUpperCase()} – ${date}</h2>

          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Article</th>
                <th>Désignation</th>
                <th>Qté</th>
                <th>${stockHeader}</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();

  } catch (err) {
    console.error("Print error:", err);
    window.alert("Erreur lors de l'impression");
  }
};



  /* =========================
     ⚙️ Effects
  ========================= */
  useEffect(() => {
    fetchMouvements();
    // eslint-disable-next-line
  }, [schema, date, page, pageSize]);

  /* =========================
     🧱 UI
  ========================= */
  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
  📦 Mouvements des Articles de {schema.toUpperCase()}  {date}
</Typography>


      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* =========================
         🔎 Filters
      ========================= */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          alignItems: "center",
        }}
      >
        <TextField
          select
          label="Schéma"
          size="small"
          value={schema}
          onChange={(e) => {
            setPage(0);
            setSchema(e.target.value);
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="cspd">CSPD</MenuItem>
          <MenuItem value="fdm">FDM</MenuItem>
        </TextField>

        <TextField
          label="Date"
          type="date"
          size="small"
          value={date}
          onChange={(e) => {
            setPage(0);
            setDate(e.target.value);
          }}
          InputLabelProps={{ shrink: true }}
        />

        <Button
          variant="outlined"
          onClick={handlePrint}
          disabled={printing}
          sx={{
            height: 40,
            textTransform: "none",
            borderColor: "#1565c0",
            color: "#1565c0",
            "&:hover": {
              backgroundColor: "#e3f2fd",
              borderColor: "#0d47a1",
            },
          }}
        >
          🖨️ Imprimer
        </Button>
      </Box>

      {/* =========================
         📋 Table
      ========================= */}
      <Table sx={{ borderRadius: 2, boxShadow: 2 }}>
        <TableHead>
  <TableRow sx={{ backgroundColor: "#1565c0" }}>
    {[
      "N°",
      "Article",
      "Désignation",
      "Qté",
      schema === "cspd" ? "Stock CSPD" : "Stock FDM",
    ].map((h) => (
      <TableCell
        key={h}
        sx={{ color: "white", fontWeight: "bold" }}
        align={h === "Qté" || h.includes("Stock") ? "right" : "left"}
      >
        {h}
      </TableCell>
    ))}
  </TableRow>
</TableHead>

<TableBody>
  {loading ? (
    <TableRow>
      <TableCell colSpan={12} align="center">
        <CircularProgress size={28} />
      </TableCell>
    </TableRow>
  ) : data.length > 0 ? (
    data.map((row, idx) => (
      <TableRow
        key={idx}
        sx={{
          backgroundColor: idx % 2 === 0 ? "#fafafa" : "#fff",
          "&:hover": { backgroundColor: "#e3f2fd" },
        }}
      >
        <TableCell>{row.NUMERO}</TableCell>
        <TableCell>{row.ARTICLE}</TableCell>
        <TableCell>{row.DESIGNATION}</TableCell>
        <TableCell align="right">{row.QTE}</TableCell>
        <TableCell align="right">{row.STOCK}</TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={12} align="center">
        Aucun mouvement trouvé
      </TableCell>
    </TableRow>
  )}
</TableBody>

      </Table>

      {/* =========================
         📑 Pagination
      ========================= */}
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[25, 50, 75, 100]}
      />
    </Box>
  );
}
