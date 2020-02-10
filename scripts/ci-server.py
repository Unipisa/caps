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
from flask import Flask, request

app = Flask(__name__)

@app.route('/', methods = [ 'GET', 'POST' ])
def update_caps():
    data = request.get_json()
    # Run the update command, and leave it running

    update_caps_bin = os.path.join(
        os.path.dirname(__file__),
        "update-caps"
    )
    os.system("flock /tmp/caps.lock -c '%s' & >> update-caps.log" % update_caps_bin)

    return "Update triggered", 200
