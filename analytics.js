/**
 var * Type: Micro Service
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
      
    const COLLECTION = "usage";
    const TIMESTAMP = "timestamp";
    const ANALYTICS = "analytics";
    const CPU_THRESHOLD_PERCENTAGE = 20.0; // Make variable names more verbose
    const MEMORY_THRESHOLD_PERCENTAGE = 73.50;
    const ANALYTIC_FOR_LAST_X_SECONDS = 600; //in seconds, anayltics calculated for t-600 to t, t is the current time.
    COMPLETE_HISTORY = true;

    ClearBlade.init({ request : req});
    ClearBlade.setUser("test@test.com", "qwer1234");
    runQuery();
    resp.success("Success");
    
    function runQuery() {
        var time = Math.floor(Date.now() / 1000);
        var collection = ClearBlade.Collection( {collectionName: COLLECTION } );
        var query = ClearBlade.Query();
        if (!COMPLETE_HISTORY) {
            query.greaterThan(TIMESTAMP, time - ANALYTIC_FOR_LAST_X_SECONDS);
        }
        query.setPage(0, 0);
        collection.fetch(query, processMessage);
    }

    function processMessage(err, data) {
        if (err) {
            log ("Error fetching data");
            resp.error("Failed to fetch data");
        } else {
            var usage = data['DATA'];
            var usageMetrics = metrics(usage);
            publishToChannel(ANALYTICS, usageMetrics);
        }
    }
    

    // Computes the metrics to push to analytics channel
    // Restrict the usage of objects to inside the block -- This wouldn't be allowed on ClearBlade probably
    function metrics(usage) {
        var len = usage.length;
        //Runtime error if len is 0
        if (len == 0) {
            log ("No new data on analytics channel");
            resp.success();
        }
        var total_cpu = 0.0;
        var total_mem = 0.0;
        var max_cpu_obj = usage[0];
        var max_mem_obj = usage[0];
        
        var peakUse = [];

        //Make usageObj immutable
        for (var usageObj in usage) {
            total_cpu += usageObj.cpu_use;
            total_mem += usageObj.memory;
            if (max_cpu_obj.cpu_use < usageObj.cpu_use) {
                max_cpu_obj = usageObj;
            }

            if (max_mem_obj.memory < usageObj.memory) {
                max_mem_obj = usageObj;
            }

            if (usageObj.memory > MEMORY_THRESHOLD_PERCENTAGE && usageObj.cpu_use > CPU_THRESHOLD_PERCENTAGE) {
                peakUse.push(usageObj);
            }
        }

        //json array can be formed directly.
        var usageMetrics = {
            "avg_cpu" : total_cpu/len,
            "avg_mem" : total_mem/len,
            "max_cpu_usage_data" : max_cpu_obj,
            "max_mem_usage_data" : max_mem_obj,
            "high_usage" : peakUse,
        }

        return usageMetrics;
        
    }

    // Removed single use variable
    function publishToChannel(topic, payload) {
        var messaging = ClearBlade.Messaging();
        messaging.publish(topic, JSON.stringify(payload));    
    }    
}
