import express from "express";
import { add, subtract } from "@examples/maths";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/maths/add/:a/:b", (req, res) => {
  console.log(req.params);
  res.send(add(+req.params.a, +req.params.b).toString());
});

app.get("/maths/subtract/:a/:b", (req, res) => {
  res.send(subtract(+req.params.a, +req.params.b).toString());
});

app.listen(3000, () => {
  console.log("Listening on port 3000.");
});
