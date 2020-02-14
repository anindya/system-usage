import math, psutil, time

def getUsage():
	usage = {}
	usage["timestamp"] = math.floor(time.time())
	usage["cpu_use"] = psutil.cpu_percent()
	vmem = dict(psutil.virtual_memory()._asdict())
	usage["mem_use"] = vmem["percent"]
	return usage
