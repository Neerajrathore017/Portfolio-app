"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";

export default function LineChartComponent() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/navdata.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          range: 5,
        });

        const formattedData = jsonData.map((row) => {
          let dateVal = row["NAV Date"];
          let navVal = row["NAV (Rs)"];

          // Try parsing Excel serial number
          if (typeof dateVal === "number") {
            const excelEpoch = new Date(1899, 11, 30);
            dateVal = new Date(excelEpoch.getTime() + dateVal * 86400000);
          } else {
            dateVal = new Date(dateVal);
          }

          // If still invalid, skip this row
          if (isNaN(dateVal.getTime())) {
            return null;
          }

          return {
            date: dateVal.toISOString().split("T")[0], // YYYY-MM-DD
            nav: Number(navVal) || 0, // make sure it's a number
          };
        }).filter(Boolean);


        formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log("for", formattedData)
        setData(formattedData);
        setFilteredData(formattedData);

        setStartDate(formattedData[0].date);
        setEndDate(formattedData[formattedData.length - 1].date);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const filtered = data.filter(
        (d) =>
          new Date(d.date) >= new Date(startDate) &&
          new Date(d.date) <= new Date(endDate)
      );
      setFilteredData(filtered);
      console.log("fil", filtered)
    }
  }, [startDate, endDate, data]);

  return (
     <Box sx={{ width: "100%", p: 3 }}>
      <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Start Date</InputLabel>
          <Select
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            label="Start Date"
          >
            {data.map((d) => (
              <MenuItem key={d.date} value={d.date}>
                {d.date}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>End Date</InputLabel>
          <Select
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            label="End Date"
          >
            {data.map((d) => (
              <MenuItem key={d.date} value={d.date}>
                {d.date}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ width: "100%", height: 500 }}>
        {filteredData.length === 0 ? (
          <Typography align="center" color="text.secondary">
            No data available
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="0" stroke="#eaeaea" />
              <XAxis dataKey="date" tick={false} axisLine={false} />
              <YAxis
                domain={[0, "dataMax"]}
                ticks={Array.from(
                  {
                    length: Math.ceil(
                      (Math.max(...filteredData.map((d) => d.nav)) + 50) / 50
                    ),
                  },
                  (_, i) => i * 50
                )}
              />
              <Line
                type="monotone"
                dataKey="nav"
                stroke="green"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>  );
}
