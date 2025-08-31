import "@/styles/globals.css";
import { Box, MenuItem, Select } from "@mui/material";
import styles from "@/styles/Home.module.css";
import Link from "next/link";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();
   const handleChange = (event) => {
    router.push(event.target.value); // Navigate to selected route
  };

  return (
    <Box className={styles.container}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <Box>
          {router.pathname === "/portfolio" ? (
            <h1 className={styles.heading}>PORTFOLIO</h1>
      
        ) : router.pathname === "/blog" && <h1>Blogs</h1>}
        </Box>
        <Box>

        <Select
          value={router.pathname} 
          onChange={handleChange}
          sx={{
            minWidth: 180,
            fontWeight: "bold",
            bgcolor: "white",
            borderRadius: "8px",
          }}
        >
          <MenuItem value="/blog">📘 Our Blog</MenuItem>
          <MenuItem value="/portfolio">📊 View Portfolio</MenuItem>
        </Select>
        </Box>
      </Box>

      <Component {...pageProps} />
    </Box>
  );
}
