const express = require("express");
const path = require("path");

const candidateService = require("./candidate.js");

const candidateServ = new candidateService(path.join(__dirname, "../proto/candidate.proto"), 50051);


const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get('/', async (req, res) => {
    try {
        const minExperience = req.query.experienceFilter ? parseInt(req.query.experienceFilter) : 0;

        const wantsToFilterListing = (req.query.listingCheckbox && req.query.listingFilter) || false;
        const listingId = wantsToFilterListing ? parseInt(req.query.listingFilter) : -1;

        const candidates = await candidateServ.searchCandidates(minExperience, listingId);
        res.render("index", { candidates });
    } catch (err) {
        console.error("Error fetching candidates:", err);
        res.status(500).send("Error fetching candidates");
    }
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Client started on http://localhost:${PORT}`);
});