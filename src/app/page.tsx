"use client";
import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

function calculateAverages(entries: { date: string; kwh: number }[]) {
  if (entries.length < 2) return { averages: [], yearlyProjection: null };
  const averages = [];
  let totalKwh = 0;
  let totalDays = 0;
  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1];
    const curr = entries[i];
    if (!prev || !curr) continue;
    const days =
      (new Date(curr.date).getTime() - new Date(prev.date).getTime()) /
      (1000 * 60 * 60 * 24);
    const kwhDiff = curr.kwh - prev.kwh;
    averages.push({
      from: prev.date,
      to: curr.date,
      avg: days > 0 ? kwhDiff / days : 0,
      days,
      kwhDiff,
    });
    totalKwh += kwhDiff;
    totalDays += days;
  }
  const avgPerDay = totalDays > 0 ? totalKwh / totalDays : 0;
  const yearlyProjection = avgPerDay * 365;
  return { averages, yearlyProjection };
}

const LOCAL_STORAGE_KEY = "energy-usage-entries";

const getToday = () => {
  // Current date: 25. April 2025
  return "2025-04-25";
};

const EnergyUsagePage = () => {
  const [entries, setEntries] = useState<{ date: string; kwh: number }[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) setEntries(JSON.parse(saved));
    setHydrated(true);
  }, []);
  const lastEntry = entries.length > 0 ? entries[entries.length - 1] : undefined;
  const lastKwh = lastEntry ? lastEntry.kwh : 0;
  const [date, setDate] = useState(getToday());
  const [kwh, setKwh] = useState(lastKwh.toString());
  const { averages, yearlyProjection } = calculateAverages(entries);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, hydrated]);

  const handleAdd = () => {
    if (!date || !kwh || isNaN(Number(kwh))) return;
    setEntries((prev) =>
      [...prev, { date, kwh: Number(kwh) }].sort((a, b) =>
        a.date.localeCompare(b.date)
      )
    );
    setDate(getToday());
    setKwh((entries.length > 0 ? entries[entries.length - 1]?.kwh ?? 0 : 0).toString());
  };

  const handleDelete = (idx: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  if (!hydrated) return null;

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom align="center">
        Energy Usage Tracker
      </Typography>
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="KWH"
          type="number"
          value={kwh}
          onChange={(e) => setKwh(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleAdd} sx={{ minWidth: 120 }}>
          Add
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">KWH</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry, idx) => (
              <TableRow key={idx}>
                <TableCell>{entry.date}</TableCell>
                <TableCell align="right">{entry.kwh}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="delete" onClick={() => handleDelete(idx)} size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {averages.length > 0 && (
        <Box mb={2}>
          <Typography variant="h6">Averages</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell align="right">Days</TableCell>
                  <TableCell align="right">KWH Used</TableCell>
                  <TableCell align="right">Avg/Day</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {averages.map((a, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{a.from}</TableCell>
                    <TableCell>{a.to}</TableCell>
                    <TableCell align="right">{a.days.toFixed(1)}</TableCell>
                    <TableCell align="right">{a.kwhDiff.toFixed(2)}</TableCell>
                    <TableCell align="right">{a.avg.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {yearlyProjection && (
        <Typography variant="h6" align="center" color="primary">
          Projected 12-month Consumption: {yearlyProjection.toFixed(2)} KWH
        </Typography>
      )}
    </Container>
  );
};

export default EnergyUsagePage;
