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
  Modal,
  Button,
} from "@mui/material";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function LineChartComponent() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);

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

        const formattedData = jsonData
          .map((row,index) => {
            let dateVal = row["NAV Date"];
            let navVal = row["NAV (Rs)"];

            // If date is a number (Excel serial date)
            if (typeof dateVal === "number") {
              const excelEpoch = new Date(1899, 11, 30);
              dateVal = new Date(excelEpoch.getTime() + dateVal * 86400000);
            } else if (typeof dateVal === "string") {
              // If date is in "DD-MM-YYYY" format
              const parts = dateVal.split("-");
              if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // month is 0-based
                const year = parseInt(parts[2], 10);
                dateVal = new Date(year, month, day);
              }
            }

            // Skip invalid dates
            if (isNaN(dateVal.getTime())) {
              return null;
            }

            return {
              date: dateVal.toISOString().split("T")[0], // YYYY-MM-DD
              nav: Number(navVal) || 0,
            };
          })
          .filter(Boolean);


        formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
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
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        setShowModal(true);
        setFilteredData([]); // optionally clear previous filtered data
        return;
      } else {
        setShowModal(false);
      }

      const filtered = data.filter(
        (d) => new Date(d.date) >= start && new Date(d.date) <= end
      );
      setFilteredData(filtered);
    }
  }, [startDate, endDate, data]);

  return (
    <>
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
      >
        <Box sx={style}>
          <Typography id="modal-title" variant="h6" component="h2">
            Invalid Date Range
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            End date must be greater than start date.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => setShowModal(false)}
          >
            Close
          </Button>
        </Box>
      </Modal>

      <Box sx={{ width: "100%", p: 3 }}>
        <Box sx={{ display: "flex", gap: 3, mb: 3, width: "30%" }}>
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
      </Box>   </>);
}
