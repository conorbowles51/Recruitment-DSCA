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

    hireCandidate(candidateId) {
        return new Promise((resolve, reject) => {
            this.service.hireCandidate({ candidateId }, (err, resp) => {
                if(err) {
                    console.log("Error hiring candidate " + candidateId);
                    reject(err);
                    return;
                }
                resolve(resp);
            });
        });
    }

    getById(candidateId) {
        return new Promise((resolve, reject) => {
            this.service.getById({ candidateId }, (err, resp) => {
                if(err) {
                    console.log("Error getting candidate " + candidateId);
                    reject(err);
                    return;
                }
                resolve(resp);
            })
        });
    }
}

module.exports = candidateService;