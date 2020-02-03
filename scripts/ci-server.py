#!/usr/bin/env python3
#

#
# CI server that automatically updates the code when
# it is pushed to the Github repository. 
#

# Run this application with:
#
# gunicorn ci-server:app -b 0.0.0.0:8081

import os
from flask import Flask

app = Flask(__name__)

@app.route('/', methods = [ 'GET', 'POST' ])
def update_caps():
    # Run the update command, and leave it running
    os.system("flock /tmp/caps.lock -c 'update-caps' >> update-caps.log &")
    return "Update triggered"
