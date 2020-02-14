from clearblade.ClearBladeCore import System
import json
import time
import properties, metrics

# credentials
SystemKey = properties.systemKey
SystemSecret = properties.systemSecret
email = properties.email
password = properties.password

mySystem = System(SystemKey, SystemSecret)
user = mySystem.User(email, password)
mqtt = mySystem.Messaging(user)

mqtt.connect()
while True:    
	usage = metrics.getUsage()
	mqtt.publish("usageQ", json.dumps(usage))
	time.sleep(10)
mqtt.disconnect()