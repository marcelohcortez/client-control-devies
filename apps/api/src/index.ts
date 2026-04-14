import app from "./app";

const port = Number(process.env["PORT"] ?? 3001);

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
