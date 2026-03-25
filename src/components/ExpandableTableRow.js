import { useState } from "react";

import {
  Box,
  Collapse,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
export const ExpandableTableRow = ({ communication, formatDate }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        key={communication.ID}
        sx={{
          "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
          "&:hover": { backgroundColor: "#f0f4f8", cursor: "pointer" },
          transition: "background-color 0.2s",
        }}
      >
        <TableCell
          sx={{
            py: 1.5,
            px: 3,
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
          }}
        >
          {formatDate(communication.DATETIME)}
        </TableCell>
        <TableCell
          sx={{
            py: 1.5,
            px: 3,
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
          }}
        >
          {communication.DETAILS_COMMUNICATION}
        </TableCell>
        <TableCell
          sx={{
            py: 1.5,
            px: 3,
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
          }}
        >
          {communication?.COMMERCIAL}
        </TableCell>
        <TableCell
          sx={{
            py: 1.5,
            px: 3,
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
          }}
        >
          {communication?.MODE_LIV}
        </TableCell>
        <TableCell
          sx={{
            py: 1.5,
            px: 3,
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
          }}
        >
          {communication.ADRESSE_LIVRAISON}
        </TableCell>
        <TableCell
          sx={{
            py: 1.5,
            px: 3,
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
          }}
        >
          {communication.TRANSP}
        </TableCell>
        <TableCell
          sx={{
            py: 1.5,
            px: 3,
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
          }}
        >
          {communication?.BENEFICIAIRE}
        </TableCell>
        <TableCell
          sx={{
            py: 1.5,
            px: 3,
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
            fontWeight: "bold",
            color: communication.paiements?.length > 0 ? "#1976d2" : "#000",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => setOpen(!open)}
        >
          <Tooltip
            title={
              open
                ? "Réduire les détails de paiement"
                : "Afficher les détails de paiement"
            }
          >
            <span>
              {communication.paiements?.length > 0
                ? communication.paiements
                    .map((p) => p.mode_paiement.LIBELLE)
                    .join(", ")
                : "-"}
            </span>
          </Tooltip>
        </TableCell>
        <TableCell
          sx={{
            py: 1.5,
            px: 3,
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
          }}
        >
          {communication.DATELIVRAISONPREVUE}
        </TableCell>
        <TableCell
          sx={{
            py: 1.5,
            px: 3,
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
          }}
        >
          {communication?.CHAUFFEUR}
        </TableCell>
        <TableCell
          sx={{
            py: 1.5,
            px: 3,
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
          }}
        >
          {communication?.VEHICULE}
        </TableCell>
          <TableCell
          sx={{
            py: 1.5,
            px: 3,
            borderBottom: "1px solid rgba(224, 224, 224, 1)",
          }}
        >
          {communication?.MODE_VOY || "-"}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 2,
                backgroundColor: "#f5f7fa",
                p: 2,
                borderRadius: 1,
              }}
            >
              {communication.paiements?.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#e0e7ff" }}>
                      <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>
                        Mode de paiement
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>
                        Montant (TND)
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>
                        Date d'échéance
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {communication.paiements.map((p) => (
                      <TableRow
                        key={p.id}
                        sx={{ "&:hover": { backgroundColor: "#e8f0fe" } }}
                      >
                        <TableCell>{p.mode_paiement.LIBELLE}</TableCell>
                        <TableCell>{p.montant.toFixed(2)}</TableCell>
                        <TableCell>{p.date_echeance || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucun paiement
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};