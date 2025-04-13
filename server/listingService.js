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
            GetAllListings: this.getAllListings
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
}

module.exports = listingService;