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

    createListings(jobTitle, numListings) {
        return new Promise((resolve, reject) => {
            const call = this.service.AddListings((err, resp) => {
                if(err) {
                    console.error("Error creating listings:", err);
                    reject(err);
                    return;
                }

                resolve(resp);
            });

            
            try {
                for (let i = 0; i < numListings; i++) {
                    call.write({ jobTitle: jobTitle });
                }
                call.end();
            } catch (error) {
                console.error("Error sending listings:", error);
                reject(error);
            }
        });
    }

    closeListing(listingId) {
        return new Promise((resolve, reject) => {
            this.service.CloseListing({ listingId }, (err, resp) => {
                if(err) {
                    console.log("Error closing listing " + listingId);
                    reject(err);
                    return;
                }
                resolve(resp);
            })
        });
    }
}

module.exports = listingService;