require("dotenv").config();
const express = require("express");
const cors = require("cors");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/pivoting", require("./routes/docker"));
app.use("/api", require("./routes/passwordReset"))
app.use("/api/subcriptions",  require("./routes/subscriptions"))
app.use("/api/web",  require("./routes/web"))
app.use("/api/ctf", require("./routes/ctf"))
app.use("/api/test-pivot", require("./routes/test-piv"));

// for flag
app.use("/api", require("./routes/profile"));
//for ctf lab list ctf player score check and how many labs solved
app.use("/api", require("./routes/ctfSolvLabs"))
app.use("/api", require("./routes/webSolvLabs"))
app.use("/api", require("./routes/pivotSolvLabs"))
app.use("/api", require("./routes/subscriptionPlan"))
app.use("/api", require("./routes/feedback"))


app.listen(3000, () => {
    console.log("Server Running on Port 3000");
});