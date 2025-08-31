"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Grid,
} from "@mui/material";

export default function BlogPage() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=trading OR stock OR finance&sortBy=publishedAt&pageSize=6&apiKey=76bb752f6a934e2c937af9036c5ce7d1`
        );
        const data = await response.json();
        if (data.articles) {
          setArticles(data.articles);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {articles.length === 0 ? (
        <Typography variant="body1" align="center">
          Loading blogs...
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {articles.map((article, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box sx={{ position: "relative" }}>
                  {article.urlToImage && (
                    <CardMedia
                      component="img"
                      height="180"
                      image={article.urlToImage}
                      alt={article.title}
                    />
                  )}
                  <Chip
                    label="Finance"
                    color="warning"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      fontWeight: "bold",
                    }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      mb: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {article.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {article.description || "No description available."}
                  </Typography>

                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mb: 2, color: "gray" }}
                  >
                    📅 {new Date(article.publishedAt).toLocaleDateString("en-GB")}
                  </Typography>

                  <Button
                    variant="contained"
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      borderRadius: 5,
                      textTransform: "none",
                      px: 3,
                      background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                    }}
                  >
                    Read More →
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
