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

function qconsumer(req,resp){
    const TOPIC = "usageQ";
    const COLLECTION = "usage";

    ClearBlade.init({ request : req});
    ClearBlade.setUser("test@test.com", "qwer1234");
    
    var messaging = ClearBlade.Messaging();
    
    messaging.getAndDeleteMessageHistory(TOPIC, 0, null, null, null, processMessage);
    
    resp.success("Success");
    function processMessage(err, data) {
        for (i = 0; i < data.length; i++) {
            var message = JSON.parse(data[i].payload);
            saveToCollection(message);    
        }
    }

    function saveToCollection(message) {
        var usageObject = {
            timestamp : message.timestamp,
            cpu_use : message.cpu_use,
            memory : message.mem_use
        };
        var callback = function (err, data) {
            if (err) {
                log("creation error : " + JSON.stringify(data));
            }
        };
        var collection = ClearBlade.Collection( {collectionName: COLLECTION } );
        collection.create(usageObject, callback);
    }
}
