import sys

from flask import Flask
from flask_cors import CORS

import lndapi

port = 1

app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"] = "!!_-pyp0k3r-_!!"
app.debug = True


@app.route("/send_payment/<string:payment_request>")
def send_payment(payment_request):
    if (lndapi.send_payment(payment_request)):
        return "true"
    return "false"


@app.route("/request_invoice/<int:amount>")
def request_invoice(amount):
    return lndapi.request_invoice(amount)


@app.route("/is_received/<string:payment_request>")
def is_received(payment_request):
    if (lndapi.is_received(payment_request)):
        return "true"
    return "false"


port_num = 0
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print "specify port index (1/2/3)"
        exit(-1)
    port_num = int(sys.argv[1])
    lndapi.stub = lndapi.getStub('localhost:' + str(10000 + port_num))
    app.run(debug=True, port=8080 + port_num, host="0.0.0.0", threaded=True)
