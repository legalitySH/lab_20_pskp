const express = require("express");
const exphbs = require("express-handlebars");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data.json");

let phoneData = fs.existsSync(DATA_FILE)
    ? JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"))
    : [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.engine("handlebars", exphbs.engine({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "./../views", "partials"),
    helpers: {
        cancelButton: () => `<a href="/" class="cancel-button">Отменить</a>`,
        concat: (...args) => {
            args.pop();
            return args.join('');
        }
    }
}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "./../views"));

app.get("/", (req, res) => {
    res.render("home", { phones: phoneData, form: "" });
});

app.get("/Add", (req, res) => {
    res.render("add", {}, (err, html) => {
        if (err) return res.status(500).send("Ошибка шаблона add");
        res.render("home", { phones: phoneData, form: html });
    });
});

app.post("/Add", (req, res) => {
    const { name, phone } = req.body;
    phoneData.push({ name, phone });
    fs.writeFileSync(DATA_FILE, JSON.stringify(phoneData, null, 2));
    res.redirect("/");
});

app.get("/Update", (req, res) => {
    const id = req.query.id;
    const entry = phoneData[id];
    if (!entry) return res.status(404).send("Запись не найдена");

    res.render("update", { entry, id }, (err, html) => {
        if (err) return res.status(500).send("Error rendering update form");
        res.render("home", { phones: phoneData, form: html });
    });
});


app.post("/Update", (req, res) => {
    const id = req.query.id;
    const { name, phone } = req.body;
    phoneData[id] = { name, phone };
    fs.writeFileSync(DATA_FILE, JSON.stringify(phoneData, null, 2));
    res.redirect("/");
});

app.post("/Delete", (req, res) => {
    const id = req.query.id;
    phoneData.splice(id, 1);
    console.log(phoneData);
    fs.writeFileSync(DATA_FILE, JSON.stringify(phoneData, null, 2));
    res.redirect("/");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
