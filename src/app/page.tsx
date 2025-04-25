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
import Avatar from "@mui/material/Avatar";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

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
    if (saved) setEntries(JSON.parse(saved) as { date: string; kwh: number }[]);
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
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8, p: 0 }}>
      <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
        <Avatar sx={{ bgcolor: "#ffe066", width: 72, height: 72, mb: 1 }}>
          <LightbulbIcon sx={{ color: "#ffb300", fontSize: 48 }} />
        </Avatar>
        <Typography variant="h3" fontWeight={700} color="#2e026d" gutterBottom align="center">
          Energy Usage Tracker
        </Typography>
        <Typography variant="subtitle1" color="#555" align="center" mb={2}>
          Track your energy usage, see averages, and project your yearly consumption.
        </Typography>
      </Box>
      <Paper elevation={4} sx={{ p: 3, mb: 4, background: "linear-gradient(135deg, #ffe066 0%, #ffb300 100%)" }}>
        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ background: "#fff", borderRadius: 1 }}
          />
          <TextField
            label="KWH"
            type="number"
            value={kwh}
            onChange={(e) => setKwh(e.target.value)}
            fullWidth
            sx={{ background: "#fff", borderRadius: 1 }}
          />
          <Button variant="contained" onClick={handleAdd} sx={{ minWidth: 120, bgcolor: "#2e026d", ':hover': { bgcolor: "#4b2997" } }}>
            Add
          </Button>
        </Box>
      </Paper>
      <Paper elevation={2} sx={{ mb: 4 }}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ background: "#f3e5f5" }}>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">KWH</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry, idx) => (
                <TableRow key={idx} sx={{ background: idx % 2 === 0 ? "#fffde7" : "#fff" }}>
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
      </Paper>
      {averages.length > 0 && (
        <Box mb={2}>
          <Typography variant="h6" color="#2e026d" fontWeight={600} mb={1}>
            Averages
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead sx={{ background: "#f3e5f5" }}>
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
                  <TableRow key={idx} sx={{ background: idx % 2 === 0 ? "#ede7f6" : "#fff" }}>
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
        <Paper elevation={3} sx={{ p: 2, background: "linear-gradient(90deg, #b388ff 0%, #ffe066 100%)" }}>
          <Typography variant="h6" align="center" color="#2e026d" fontWeight={700}>
            Projected 12-month Consumption: {Math.round(yearlyProjection).toLocaleString("de-DE")} KWH
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default EnergyUsagePage;
