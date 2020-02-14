System Usage Analyzer
=========
Reads CPU Usage and Memory usage of the system every 10 seconds to create a average system usage view.


Requirements
--------------
* python3
* psutil

How to use
--------------

```sh
If you don't have psutil installed, install using ** pip install psutil **
git clone git@github.com:anindya/system-usage.git
cd "system-usage"

Place the js files as code services in your ClearBlade service.
Update properties.py with the correct credentials.


run as:
	python3 data.py
```