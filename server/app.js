const candidateService = require("./candidateService.js");
const listingService = require("./listingService.js");
const interviewService = require("./interviewService.js");

new candidateService().init();
new listingService().init();
new interviewService().init();