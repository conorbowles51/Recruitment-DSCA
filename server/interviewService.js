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
            ScheduleInterview: this.scheduleInterview
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
}

module.exports = interviewService;