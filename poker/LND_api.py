# -*- coding: utf-8 -*-
import rpc_pb2 as ln
import rpc_pb2_grpc as lnrpc
import grpc
import os
import codecs
TIMEOUT_OFF = 300
DEBUG = False

# Due to updated ECDSA generated tls.cert we need to let gprc know that
# we need to use that cipher suite otherwise there will be a handhsake
# error when we communicate with the lnd rpc server.
os.environ["GRPC_SSL_CIPHER_SUITES"] = 'HIGH+ECDSA'

# Lnd cert is at ~/.lnd/tls.cert on Linux and
# ~/Library/Application Support/Lnd/tls.cert on Mac
cert = open(os.path.expanduser('/Users/uri/Projects/pypoker/tls.cert'), 'rb').read()
creds = grpc.ssl_channel_credentials(cert)


#
# # for raise
# def request_invoice(bet_amount):
#     return "hii this is our pay req"
#
#
# def is_received(pay_req):
#     return True
#
#
# # for winner detected
# def send_payment(pay_req):
#     return True


# from ip:port of lnd client, get stub
def getStub(url):
    channel = grpc.secure_channel(url, creds)
    return lnrpc.LightningStub(channel)


stub = getStub('localhost:10009')


# create invoice for amount and return payment_request
def request_invoice(amt):
    if DEBUG:
        return "mock pay_req"
    request = ln.Invoice(value=int(amt))
    response = stub.AddInvoice(request)
    return response.payment_request


# check invoice received
def is_received(pay_req):
    if DEBUG:
        return True
    # first decode pay_req to get pay_hash
    request = ln.PayReqString(pay_req=pay_req)
    response = stub.DecodePayReq(request)
    pay_hash = response.payment_hash

    # check if settled
    request = ln.PaymentHash(r_hash_str=pay_hash)
    response = stub.LookupInvoice(request)
    return response.settled


# send payment by request
def send_payment(pay_req):
    if DEBUG:
        return True
    request = ln.SendRequest(payment_request=pay_req)
    response = stub.SendPaymentSync(request)
    return True


# list of ports for users (without server)
# stub of users
alice_stub = getStub('localhost:10001')
bob_stub = getStub('localhost:10002')
charlie_stub = getStub('localhost:10003')

# pay_req = request_invoice(100000)
# print pay_req
#
# print is_received( pay_req)
#
# send_payment( pay_req)
#
# print is_received(pay_req)



# Server connect to all peers on lnd
# Server open lnd channels with all players, funding them big time with push with params
# generate 6 blocks
# check active channels
