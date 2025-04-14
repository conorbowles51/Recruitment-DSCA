const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "../proto/scheduling.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const schedulingProto = grpc.loadPackageDefinition(packageDefinition).scheduling;

const interviews = require("./data/interviews.js");

class interviewService {
    init() {
        const server = new grpc.Server();

        server.addService(schedulingProto.SchedulingService.service, {
            GetAllInterviews: this.getAllInterviews,
            ScheduleInterview: this.scheduleInterview,
            SetStatus: this.setStatus
        });

        server.bindAsync('127.0.0.1:50053', grpc.ServerCredentials.createInsecure(), () => {
            console.log("interviewService is running");
        });
    }

    getAllInterviews = (call) => {
        interviews.forEach(interview => {
            call.write(interview);
        });
    
        call.end();
    }

    scheduleInterview = (call, callback) => {
        const interview = { ...call.request };

        interviews.push(interview);

        callback(null, {});
    }

    setStatus = (call, callback) => {
        const candidateId = call.request.candidateId;
        const status = call.request.status;

        interviews.forEach(interview => {
            if(interview.candidateId === candidateId){
                interview.status = status;
            }
        })

        callback(null, {});
    }
}

module.exports = interviewService;