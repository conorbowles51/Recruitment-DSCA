const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "../proto/job_listing.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const listingProto = grpc.loadPackageDefinition(packageDefinition).jobListing;

const listings = require("./data/listings.js");

class listingService {
    init(){
        const server = new grpc.Server();
        
        server.addService(listingProto.JobListingService.service, {
            GetAllListings: this.getAllListings,
            AddListings: this.addListings
        });
        
        server.bindAsync('127.0.0.1:50052', grpc.ServerCredentials.createInsecure(), () => {
            console.log("ListingService is running");
        });
    }

    getAllListings = (call) => {
        listings.forEach(listing => {
            call.write(listing);
        });
    
        call.end();
    }

    addListings = (call, callback) => {
        call.on('data', (req) => {
            const listing = {
                listingId: listings.length,
                jobTitle: req.jobTitle,
                status: 'open'
            };
            listings.push(listing);
        })

        call.on('end', () => {
            callback(null, {});
        });

        call.on('error', (error) => {
            console.error("Error in createListings:", error);
            callback(error);
        });
    }
}

module.exports = listingService;