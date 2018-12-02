const axios = require("axios");
const fs = require("fs");

const instance = axios.create({
  baseURL: "https://api.vtlog.net/v1",
  timeout: 50000,
  headers: { "X-API-KEY": "" }
});

const jobsByUser = {};
const company = { jobsCount: 0, jobsDistance: 0, jobsFinance: 0 };

//For DEC
const startTime = 1543622400;
const endTime = 1546214400;

//For NOV
// const startTime = 1541030400;
// const endTime = 1543622400;

var date1 = new Date(0);
date1.setUTCSeconds(startTime);
console.log("StartTime: " + date1);
var date2 = new Date(0);
date2.setUTCSeconds(endTime);
console.log("EndTime: " + date2);

var someDataFlag = false;
(async () => {
  let page = 1;
  do {
    const response = await instance.get("companies/53/jobs", {
      params: { page: page, limit: 99 }
    });
    page++;
    var flag = true;
    response.data.response.jobs.forEach(job => {
      if (job.realStartTime > startTime && job.realStartTime < endTime && job.canceled == "0") {
        someDataFlag = true;
        flag = false;
        company.jobsCount++;
        company.jobsDistance += parseInt(job.odometer);
        company.jobsFinance += parseInt(job.fin_result);
        if (Object.keys(jobsByUser).includes(job.username)) {
          const { jobsCount, jobsDistance, jobsFinance } = jobsByUser[job.username];
          jobsByUser[job.username] = {
            jobsCount: jobsCount + 1,
            jobsDistance: jobsDistance + parseInt(job.odometer),
            jobsFinance: jobsFinance + parseInt(job.fin_result)
            // avgLength: jobsDistance / jobsCount
          };
        } else {
          jobsByUser[job.username] = {
            jobsCount: 1,
            jobsDistance: parseInt(job.odometer),
            jobsFinance: parseInt(job.fin_result)
            // avgLength: parseInt(job.odometer)
          };
        }
      }
    });
    if (someDataFlag && flag) {
      console.log("Gone till page: " + page);
      break;
    }
  } while (true);
  company.avgLength = company.jobsDistance / company.jobsCount;
  company.user = jobsByUser;
  fs.writeFile("./data.json", JSON.stringify(company, null, "  "), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
})();