const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

class candidateService {
    constructor (protoPath, port){
        const packageDefinition = protoLoader.loadSync(protoPath, {});
        const proto = grpc.loadPackageDefinition(packageDefinition).candidate;

        this.service = new proto.CandidateService(`localhost:${port}`, grpc.credentials.createInsecure());
    }

    searchCandidates(experience, listingId){
        return new Promise((resolve, reject) => {
            const request = { experience, listingId };
            const call = this.service.searchCandidates(request);
    
            const candidates = [];
    
            call.on('data', (candidate) => {
                candidates.push(candidate);
            });
    
            call.on('error', (err) => {
                console.error("Error:", err);
                reject(err);
            });
    
            call.on('end', () => {
                resolve(candidates);
            });
        });
    }
}

module.exports = candidateService;