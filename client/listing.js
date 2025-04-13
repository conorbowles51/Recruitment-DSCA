const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

class listingService {
    constructor (protoPath, port){
        const packageDefinition = protoLoader.loadSync(protoPath, {});
        const proto = grpc.loadPackageDefinition(packageDefinition).jobListing;

        this.service = new proto.JobListingService(`localhost:${port}`, grpc.credentials.createInsecure());
    }

    getAllListings(){
        return new Promise((resolve, reject) => {
            const call = this.service.getAllListings({});
    
            const listings = [];
    
            call.on('data', (listing) => {
                listings.push(listing);
            });
    
            call.on('error', (err) => {
                console.error("Error:", err);
                reject(err);
            });
    
            call.on('end', () => {
                resolve(listings);
            });
        });
    }
}

module.exports = listingService;