const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

class interviewService {
    constructor (protoPath, port){
        const packageDefinition = protoLoader.loadSync(protoPath, {});
        const proto = grpc.loadPackageDefinition(packageDefinition).scheduling;

        this.service = new proto.SchedulingService(`localhost:${port}`, grpc.credentials.createInsecure());
    }

    getAllInterviews(){
        return new Promise((resolve, reject) => {
            const call = this.service.getAllInterviews({});
    
            const interviews = [];
    
            call.on('data', (interview) => {
                interviews.push(interview);
            });
    
            call.on('error', (err) => {
                console.error("Error:", err);
                reject(err);
            });
    
            call.on('end', () => {
                resolve(interviews);
            });
        });
    }

    scheduleInterview(interview) {
        return new Promise((resolve, reject) => {
            this.service.scheduleInterview(interview, (err, resp) => {
                if(err) {
                    console.log("Error scheduling interview ");
                    reject(err);
                    return;
                }
                resolve(resp);
            })
        });
    }
}

module.exports = interviewService;