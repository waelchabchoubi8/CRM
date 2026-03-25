import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import BASE_URL from '../Utilis/constantes';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function SalesHistogram({ reference, base }) {
  const [data, setData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(`${BASE_URL}/api/venteStatArticle`, {
          params: { reference, base }
        });
        if(result.data.length > 0) {
          console.log("vente result", result.data);
        }
      
        const months = [];
        const quantities = [];

        
        result.data.forEach(row => {
          months.push(row.MONTH); 
          quantities.push(row.TOTAL_QTE);
        });

        setData({
          labels: months,
          datasets: [
            {
              label: 'Quantité Vendue',
              data: quantities,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching sales data:', error);
      }
    };

    fetchData();
  }, [reference, base]);

  return (
    <div>
     
      <Bar
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(tooltipItem) {
                  return `Quantité: ${tooltipItem.raw}`;
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Mois'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Quantité'
              },
              beginAtZero: true
            }
          }
        }}
      />
    </div>
  );
}

export default SalesHistogram;
