const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/docker", require("./routes/docker"));

app.listen(3000, () => {
    console.log("Server Running on Port 3000");
});