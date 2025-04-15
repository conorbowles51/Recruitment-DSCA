const express = require("express");
const path = require("path");

const candidateService = require("./candidate.js");
const listingService = require("./listing.js");
const interviewService = require("./interview.js");

const userAccounts = [
    { username: "admin", password: "password" }
]

let authenticated = false;

const candidateServ = new candidateService(path.join(__dirname, "../proto/candidate.proto"), 50051);
const listingServ = new listingService(path.join(__dirname, "../proto/job_listing.proto"), 50052);
const interviewServ = new interviewService(path.join(__dirname, "../proto/scheduling.proto"), 50053);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    userAccounts.forEach(acc => {
        if(acc.username == username && acc.password == password) {
            authenticated = true;
            res.redirect('/');
            return;
        }
    })

    res.redirect('/login');
});

app.get('/', async (req, res) => {
    if(!authenticated){
        res.redirect('/login');
        return;
    }

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
    if(!authenticated){
        res.redirect('/login');
        return;
    }

    try {
        const listings = await listingServ.getAllListings();
        res.render("listings", { listings });
    } catch (err) {
        console.error("Error fetching listings: ", err);
        res.status(500).send("Error fetching listings");
    }
});

app.post('/listings', async (req, res) => {
    if(!authenticated){
        res.redirect('/login');
        return;
    }

    try {
        const { jobTitle, quantity } = req.body;
        
        const numListings = parseInt(quantity);
        
        await listingServ.createListings(jobTitle, numListings);
        
        
        res.redirect('/listings');
    } catch (err) {
        console.error("Error creating listings: ", err);
        res.status(500).send("Error creating listings");
    }
});


app.post('/hire', async (req, res) => {
    if(!authenticated){
        res.redirect('/login');
        return;
    }

    try {
        const candidateId = req.body.candidateId;
        const listingId = req.body.listingId;

        await candidateServ.hireCandidate(candidateId);
        await listingServ.closeListing(listingId);


        res.redirect('/');
    } catch (err) {
        console.error("Error hiring candidate: ", err);
        res.status(500).send("Error hiring candidate");
    }
});

app.get('/interviews', async (_req, res) => {
    if(!authenticated){
        res.redirect('/login');
        return;
    }

    try {
        const interviews = await interviewServ.getAllInterviews();

        console.log(interviews[0])
        
        res.render("interviews", { interviews });
    } catch (err) {
        console.error("Error fetching interviews:", err);
        res.status(500).send("Error fetching interviews");
    }
});

app.post('/interviews/:candidateId/complete', async (req, res) => {
    if(!authenticated){
        res.redirect('/login');
        return;
    }

    try {
        const candidateId = req.params.candidateId;

        await interviewServ.setStatus(candidateId, "complete");
        await candidateServ.setStatus(candidateId, "interviewed");

        res.redirect('/interviews');
    } catch (err) {
        console.error("Error completing interview:", err);
        res.status(500).send("Error completing interview");
    }
});


app.post('/interviews/:candidateId/cancel', async (req, res) => {
    if(!authenticated){
        res.redirect('/login');
        return;
    }

    try {
        const candidateId = req.params.candidateId;

        await interviewServ.setStatus(candidateId, "canceled");
        await candidateServ.setStatus(candidateId, "pending");

        res.redirect('/interviews');
    } catch (err) {
        console.error("Error cancelling interview:", err);
        res.status(500).send("Error cancelling interview");
    }
});



app.get('/schedule/:candidateId', async (req, res) => {
    if(!authenticated){
        res.redirect('/login');
        return;
    }

    try {
        const candidateId = parseInt(req.params.candidateId);
        const candidate = await candidateServ.getById(candidateId);

        res.render("schedule", { candidate });

    } catch (err) {
        console.error("Error fetching candidate: ", err);
        res.status(500).send("Error fetching candidate");
    }
});

app.post('/schedule', async (req, res) => {
    if(!authenticated){
        res.redirect('/login');
        return;
    }

    try {
        const candidateId = req.body.candidateId;

        if(!candidateId){
            console.error(`Could not schedule interview with candidate ID  ${candidateId} (It does not exist)`);
        }

        const candidate = await candidateServ.getById(candidateId);

        const interview = {
            candidateId,
            candidateName: candidate.name,
            date: req.body.interviewDate,
            time: req.body.interviewTime,
            type: req.body.interviewType,
            interviewer: req.body.interviewer,
            status: "scheduled"
        }

       
        await interviewServ.scheduleInterview(interview).then(async () => {
            await candidateServ.setStatus(candidateId, "interviewing");
        });
       
        

        res.redirect('/');

    } catch (err) {
        console.error("Error scheduling interview: ", err);
        res.status(500).send("Error scheduling interview");
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Client started on http://localhost:${PORT}`);
});