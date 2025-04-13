const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "../proto/candidate.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const candidateProto = grpc.loadPackageDefinition(packageDefinition).candidate;

const candidates = require("./data/candidates.js");

class candidateService {
    init() {
        const server = new grpc.Server();

        server.addService(candidateProto.CandidateService.service, {
            SearchCandidates: this.searchCandidates,
            HireCandidate: this.hireCandidate
        });

        server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), () => {
            console.log("CandidateService is running");
        });
    }

    searchCandidates = (call) => {
        const experience = call.request.experience;
        const listingId = call.request.listingId;
        
        let cands = candidates;
        
        if(listingId !== -1){
            cands = candidates.filter(cand => cand.listingId === listingId);
        }
    
        const result = cands.filter(cand => cand.experience >= experience);
    
        result.forEach(cand => {
            call.write(cand);
        });
    
        call.end();
    }

    hireCandidate = (call, callback) => {
        try {
            const candId = call.request.candidateId;

            if(!candidates[candId]){
                callback({
                    code: grpc.status.NOT_FOUND,
                    message: `Candidate with ID ${candidateId} not found`
                });

                return;
            }

            candidates[candId].status = "hired";
            callback(null, {});

        } catch  (error) {
            console.error("Error hiring candidate:", error);
            callback({
                code: grpc.status.INTERNAL,
                message: "Internal server error while hiring candidate"
            });
        }
    }
    
}

module.exports = candidateService;