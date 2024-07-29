import {
  Box,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import React from "react";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CashflowUI = () => {
  const grossMarginData = {
    labels: ["Project 1", "Project 2", "Project 3"],
    datasets: [
      {
        label: "Gross Margin",
        data: [12, 19, 3],
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        borderRadius: 4,
        hoverBackgroundColor: "rgba(75, 192, 192, 0.9)",
      },
    ],
  };

  const budgetVarianceData = {
    labels: ["Project 1", "Project 2", "Project 3"],
    datasets: [
      {
        label: "Budget Variance",
        data: [10, -15, 5],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 2,
        borderRadius: 4,
        hoverBackgroundColor: [
          "rgba(255, 99, 132, 0.9)",
          "rgba(54, 162, 235, 0.9)",
          "rgba(255, 206, 86, 0.9)",
        ],
      },
    ],
  };

  const cashflowData = {
    labels: ["Project 1", "Project 2", "Project 3"],
    datasets: [
      {
        label: "Cashflow",
        data: [200, 150, 100],
        backgroundColor: [
          "rgba(255, 159, 64, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
        ],
        borderColor: [
          "rgba(255, 159, 64, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          "rgba(255, 159, 64, 0.9)",
          "rgba(75, 192, 192, 0.9)",
          "rgba(153, 102, 255, 0.9)",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#333",
          font: {
            family: "Roboto",
            size: 14,
            weight: "bold",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.7)",
        titleFont: {
          family: "Roboto",
          size: 16,
        },
        bodyFont: {
          family: "Roboto",
          size: 14,
        },
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#555",
          font: {
            family: "Roboto",
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: "#e0e0e0",
        },
        ticks: {
          color: "#555",
          font: {
            family: "Roboto",
            size: 12,
          },
        },
      },
    },
  };

  const revenueGrowthData = [
    { project: "Project 1", amount: "€55,350.71", change: -3.78 },
    { project: "Project 2", amount: "€3,033.79", change: 4.37 },
    { project: "Project 3", amount: "€513.24", change: -4.32 },
  ];

  const transactions = [
    { date: "Il y a 1 jour", description: "Achat PC", amount: "-7.30€" },
    {
      date: "Il y a 2 jours",
      description: "Virement Apport",
      amount: "+12.00€",
    },
    { date: "Il y a 3 jours", description: "Port", amount: "-5.89€" },
    // Add more transactions as needed
  ];
  return (
    <Container
      className="dashboard-container"
      style={{ backgroundColor: "#f5f5f5", padding: "20px" }}
    >
      <Typography
        variant="h4"
        className="dashboard-title"
        gutterBottom
        style={{ color: "#3f51b5" }}
      >
        Financial Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            className="dashboard-paper"
            style={{ border: "1px solid #e0e0e0" }}
          >
            <Box p={2}>
              <Typography
                variant="h6"
                className="dashboard-heading"
                style={{ color: "#3f51b5" }}
              >
                Gross Margin by Project
              </Typography>
              <Bar data={grossMarginData} options={options} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            className="dashboard-paper"
            style={{ border: "1px solid #e0e0e0" }}
          >
            <Box p={2}>
              <Typography
                variant="h6"
                className="dashboard-heading"
                style={{ color: "#3f51b5" }}
              >
                Revenue Growth Rate
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Project</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Change</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenueGrowthData.map((row) => (
                      <TableRow key={row.project}>
                        <TableCell>{row.project}</TableCell>
                        <TableCell>{row.amount}</TableCell>
                        <TableCell
                          style={{
                            color: row.change < 0 ? "#f44336" : "#4caf50",
                          }}
                        >
                          {row.change}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            className="dashboard-paper"
            style={{ border: "1px solid #e0e0e0" }}
          >
            <Box p={2}>
              <Typography
                variant="h6"
                className="dashboard-heading"
                style={{ color: "#3f51b5" }}
              >
                Budget Variance by Project
              </Typography>
              <Bar data={budgetVarianceData} options={options} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            className="dashboard-paper"
            style={{ border: "1px solid #e0e0e0" }}
          >
            <Box p={2}>
              <Typography
                variant="h6"
                className="dashboard-heading"
                style={{ color: "#3f51b5" }}
              >
                Cashflow Comparison
              </Typography>
              <Pie data={cashflowData} options={options} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            className="dashboard-paper"
            style={{ border: "1px solid #e0e0e0" }}
          >
            <Box p={2}>
              <Typography
                variant="h6"
                className="dashboard-heading"
                style={{ color: "#3f51b5" }}
              >
                Last Transactions
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell
                          style={{
                            color: transaction.amount.startsWith("-")
                              ? "#f44336"
                              : "#4caf50",
                          }}
                        >
                          {transaction.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CashflowUI;
