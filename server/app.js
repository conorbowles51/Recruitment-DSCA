const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "../proto/candidate.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const candidateProto = grpc.loadPackageDefinition(packageDefinition).candidate;

const candidates = require("./data/candidates.js");

const searchCandidates = (call) => {
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

const server = new grpc.Server();

server.addService(candidateProto.CandidateService.service, {
    SearchCandidates: searchCandidates
});

server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log("CandidateService is running");
});
