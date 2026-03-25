import React, { useEffect, useState } from "react";
import { Box, Typography, Checkbox, TextField, Button } from "@mui/material";
import emptyBattery from '../icons/emptybattery.png';
import midBattery from '../icons/mid-battery.png';
import lowBattery from '../icons/low-battery.png';
import fullBattery from '../icons/full-battery.png';
import BASE_URL from "../Utilis/constantes";
import axios from "axios";

export default function RenderStockGros({ article }) {
  const [depots, setDepots] = useState([]);
  const [checkedDepot, setCheckedDepot] = useState(null);
  const [qteBesoin, setQteBesoin] = useState("");

  useEffect(() => {
    const fetchDepots = async () => {
      try {
        const result = await axios.get(`${BASE_URL}/api/getDepotsByArticle`, {
          params: {
            code_article: article.CODE_ARTICLE,
          }
        });
        setDepots(result.data);
      } catch (error) {
        console.error("Error fetching depots:", error);
        setDepots([]);
      }
    };

    fetchDepots();
  }, [article]);

  const handleCheck = (depot) => {
    setCheckedDepot(depot);
  };

  const [buttonStatus, setButtonStatus] = useState({ text: 'Vérifier disponibilité', color: 'primary', fontWeight: 'bold' });

  const handleQteBesoinChange = (event) => {
    const newValue = event.target.value;
    setQteBesoin(newValue);

    if (checkedDepot && newValue !== "") {
      if (parseInt(newValue) <= checkedDepot.QUANTITE_LIG) {
        setButtonStatus({ text: 'Quantité disponible', color: 'success' });
      } else {
        setButtonStatus({ text: 'Quantité non disponible', color: 'error' });
      }
    } else if (newValue === "") {
      setButtonStatus({ text: 'Veuillez entrer une quantité', color: 'warning' });
    } else {
      setButtonStatus({ text: 'Veuillez sélectionner un dépôt', color: 'warning' });
    }
  };

  const handleCheckAvailability = () => {
    if (checkedDepot && qteBesoin !== "") {
      if (parseInt(qteBesoin) <= checkedDepot.QUANTITE_LIG) {
        alert("Quantité disponible dans le dépôt");
      } else {
        alert("Quantité indisponible");
      }
    } else {
      alert("Veuillez sélectionner un dépôt et saisir une quantité");
    }
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCheckAvailability();
    }
  };

  return (
    <Box>
      {depots.length === 0 ? (
        <Box display="flex" flexDirection="row" alignItems="center" mb={1}>
          <Typography variant="body2" style={{ width: 300, color: "black" }}>
            Pas d'informations sur la disponibilité
          </Typography>
          <img
            src={emptyBattery}
            alt="Empty Battery"
            style={{ height: 20, width: 20, marginLeft: "auto", marginRight: "10%" }}
          />
        </Box>
      ) : (
        <Box>
          {depots.map((depot) => {
            let img = (
              <img
                src={midBattery}
                alt="Mid Battery"
                style={{ height: 20, width: 20, marginLeft: "auto", marginRight: "10%" }}
              />
            );

            if (depot.QUANTITE_LIG < 1) {
              img = (
                <img
                  src={lowBattery}
                  alt="Low Battery"
                  style={{ height: 20, width: 20, marginLeft: "auto", marginRight: "10%" }}
                />
              );
            }

            if (depot.QUANTITE_LIG > 5) {
              img = (
                <img
                  src={fullBattery}
                  alt="Full Battery"
                  style={{ height: 20, width: 20, marginLeft: "auto", marginRight: "10%" }}
                />
              );
            }

            return (
              <Box key={depot.INTITULE_DEPOT} display="flex" flexDirection="row" alignItems="center" mb={1}>

                <Typography variant="body2" style={{ width: "80%", color: "black" }}>
                  <span style={{ color: "black", fontWeight: "bold" }}> {depot.table}  :  </span> {depot.INTITULE_DEPOT}
                </Typography>

                {img}
         
                <Checkbox
                  checked={checkedDepot?.INTITULE_DEPOT === depot.INTITULE_DEPOT || false}
                  onChange={() => handleCheck(depot)}
                  style={{ marginLeft: 10 }}
                />
              </Box>
            );
          })}
          <Box display="flex" alignItems="center" mt={2} style={{ display: "flex", alignItems: "center" }}>
            <TextField
              label="Quantité  besoin"
              value={qteBesoin}
              onChange={handleQteBesoinChange}
              onKeyDown={handleKeyDown}
              type="number"
              style={{ marginRight: 25, width: "150px" }}
            />
            <Button
              variant="contained"
              color={buttonStatus.color}
              style={{
                backgroundColor: buttonStatus.color === 'success' ? 'green' : buttonStatus.color === 'error' ? 'red' : 'orange',
                height: '55px'
              }}
            >
              {buttonStatus.text}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
