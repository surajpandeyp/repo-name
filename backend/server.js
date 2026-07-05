const express = require("express");
const cors = require("cors");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/pivoting", require("./routes/docker"));
app.use("/reset-password", require("./routes/passwordReset"))
app.use("/subcriptions",  require("./routes/subscriptions"))
app.use("/web",  require("./routes/web"))
app.use("/ctf", require("./routes/ctf"))
app.use("/test", require("./routes/test"));


app.listen(3000, () => {
    console.log("Server Running on Port 3000");
});