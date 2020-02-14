/**
 * Type: Micro Service
 * Description: A short-lived service which is expected to complete within a fixed period of time.
 * @param {CbServer.BasicReq} req
 * @param {string} req.systemKey
 * @param {string} req.systemSecret
 * @param {string} req.userEmail
 * @param {string} req.userid
 * @param {string} req.userToken
 * @param {boolean} req.isLogging
 * @param {[id: string]} req.params
 * @param {CbServer.Resp} resp
 */

function analytics(req,resp){
    // These are parameters passed into the code service
    
    const COLLECTION = "usage";
    const TIMESTAMP = "timestamp";
    const ANALYTICS = "analytics";
    const CPU_THRESHOLD = 20.0;
    const MEMORY_THRESHOLD = 73.50;
    const ANALYTICS_TIME = 600; //in seconds, anayltics calculated for t-600 to t, t is the current time.
    COMPETE_HISTORY = true;

    ClearBlade.init({ request : req});
    ClearBlade.setUser("test@test.com", "qwer1234");
    runQuery();
    resp.success("Success");
    
    function runQuery() {
        time = Math.floor(Date.now() / 1000);
        var collection = ClearBlade.Collection( {collectionName: COLLECTION } );
        var query = ClearBlade.Query();
        if (!COMPETE_HISTORY) {
            query.greaterThan(TIMESTAMP, time - ANALYTICS_TIME);
        }
        query.setPage(0, 0);
        collection.fetch(query, processMessage);
    }

    function processMessage(err, data) {
        if (err) {
            log ("Error fetching data");
            resp.error("Failed to fetch data");
        } else {
            usage = data['DATA'];
            usageMetrics = metrics(usage);
            publishToChannel(ANALYTICS, usageMetrics);
        }
    }
    

    // Computes the metrics to push to analytics channel
    function metrics(usage) {
        len = usage.length;

        total_cpu = 0.0;
        total_mem = 0.0;
        max_cpu_obj = usage[0];
        max_mem_obj = usage[0];
        
        var peakUse = [];

        for (i = 0; i < len; i++) {
            usageObj = usage[i];
            total_cpu += usageObj.cpu_use;
            total_mem += usageObj.memory;
            if (max_cpu_obj.cpu_use < usageObj.cpu_use) {
                max_cpu_obj = usageObj;
            }

            if (max_mem_obj.memory < usageObj.memory) {
                max_mem_obj = usageObj;
            }

            if (usageObj.memory > MEMORY_THRESHOLD && usageObj.cpu_use > CPU_THRESHOLD) {
                peakUse.push(usageObj);
            }
        }

        var usageMetrics = {};
        usageMetrics["avg_cpu"] = total_cpu/len;
        usageMetrics["avg_mem"] = total_mem/len;
        usageMetrics["max_cpu_usage_data"] = max_cpu_obj;
        usageMetrics["max_mem_usage_data"] = max_mem_obj;
        usageMetrics["high_usage"] = peakUse;

        return usageMetrics;
        
    }

    function publishToChannel(topic, payload) {
        var messaging = ClearBlade.Messaging();
        messaging.publish(topic, JSON.stringify(payload));
    }    
}
