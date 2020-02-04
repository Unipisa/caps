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

@app.route('/')
def update_caps():
    # Run the update command, and leave it running

    update_caps_bin = os.path.join(
        os.path.dirname(__file__),
        "update-caps"
    )
    os.system("flock /tmp/caps.lock -c '%s' &" % update_caps_bin)

    return "Update triggered"

    
