const express = require("express");
const path = require("path");

const candidateService = require("./candidate.js");
const listingService = require("./listing.js");

const candidateServ = new candidateService(path.join(__dirname, "../proto/candidate.proto"), 50051);
const listingServ = new listingService(path.join(__dirname, "../proto/job_listing.proto"), 50052);

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

app.get('/listings', async (req, res) => {
    try {
        const listings = await listingServ.getAllListings();
        res.render("listings", { listings });
    } catch (err) {
        console.error("Error fetching listings: ", err);
        res.status(500).send("Error fetching listings");
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Client started on http://localhost:${PORT}`);
});