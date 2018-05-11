var grpc = require('grpc');
var fs = require("fs");

// Due to updated ECDSA generated tls.cert we need to let gprc know that
// we need to use that cipher suite otherwise there will be a handhsake
// error when we communicate with the lnd rpc server.
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
//TODO remove/mock tls
var tls = `
-----BEGIN CERTIFICATE-----
MIICVzCCAf2gAwIBAgIRAIEqUwUPxUajZS97MnW+0JIwCgYIKoZIzj0EAwIwRDEf
MB0GA1UEChMWbG5kIGF1dG9nZW5lcmF0ZWQgY2VydDEhMB8GA1UEAxMYTGlvcmVz
LU1hY0Jvb2stUHJvLmxvY2FsMB4XDTE4MDUwOTA4Mjg0NFoXDTE5MDcwNDA4Mjg0
NFowRDEfMB0GA1UEChMWbG5kIGF1dG9nZW5lcmF0ZWQgY2VydDEhMB8GA1UEAxMY
TGlvcmVzLU1hY0Jvb2stUHJvLmxvY2FsMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD
QgAE/Oywe1KvXpdjRmFuxr0/7NytfoRpjL4yaSGVwMlI/WgG3OPOWd5mRKlI4d/l
wE8hKOdZADk2xbP9Um/0YoVV2qOBzzCBzDAOBgNVHQ8BAf8EBAMCAqQwDwYDVR0T
AQH/BAUwAwEB/zCBqAYDVR0RBIGgMIGdghhMaW9yZXMtTWFjQm9vay1Qcm8ubG9j
YWyCCWxvY2FsaG9zdIcEfwAAAYcQAAAAAAAAAAAAAAAAAAAAAYcQ/oAAAAAAAAAA
AAAAAAAAAYcQ/oAAAAAAAAAYjvUMvo5QtocECgAAcIcQ/oAAAAAAAAA85LD//mYI
DocQ/oAAAAAAAAAaisT38xOKz4cQ/oAAAAAAAACIybORbhfvJjAKBggqhkjOPQQD
AgNIADBFAiBqRrMlASjxmHwZRvhPQ89cqOfwdBChoGlW4mKiQMDfZwIhAOChCHmK
qAOMMsPdTIk/yO9U25ekRqTvOGilsx5QaST7
-----END CERTIFICATE-----
`;


function LND_api(url) {
    var credentials = grpc.credentials.createSsl(Buffer(tls));
    var lnrpcDescriptor = grpc.load("rpc.proto");
    var lnrpc = lnrpcDescriptor.lnrpc;

    this.url = url;
    this.client = new lnrpc.Lightning(url, credentials);
}

module.exports = LND_api;

lnd = new LND_api('localhost:10001')
lnd.client.getInfo({}, function(err, response) {
    console.log('GetInfo:', response);
});



LND_api.prototype.request_invoice = function (amount) {
    call = this.client.addInvoice({
        memo: "test",
        value: amount
    }, function(err, response) {
        if (err) {
            console.log("request_invoice" + err);
        } else {
            console.log('payment_request: ' + response.payment_request);
        }

    })
};

LND_api.prototype.send_payment = function (payment_request) {
    call = this.client.sendPaymentSync({
        payment_request: payment_request
    }, function(err, response) {
            if (err) {
                console.log("send_payment" + err);
            } else {
                console.log('SendPaymentSync: ' + response);
            }
        })
};

LND_api.prototype.is_received = function (payment_request) {
    call = this.client.decodePayReq({
        pay_req: payment_request,
    }, function(err, response) {
        console.log('DecodePayReq: ' + response);
        call = lnd.client.lookupInvoice({
            r_hash_str: response.payment_hash
        }, function(err, response) {
            if (err) {
                console.log("is_received" + err);
            } else {
                console.log('is_received: ' + response.settled);
            }
        })
    })
    return true;
};


lnd.request_invoice(1000);
lnd.send_payment("lnbc1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w");
lnd.is_received("lnsb10u1pd0f5j9pp57yvngrrg62577x7k77n5m27tcugg6stw6mtcgu6l5jzej3wvk3nqdq8w3jhxaqcqzyssuclcv7nz8mlpc92zppm6d72gucehrauqtkn84e4knxsyxe4qc8y33fvacwp2yxqd4sw8gnz9tp670xpnjxaey9l82rjxfdsa8xw37spgny86j");


//ssh liorefinkelsteien@10.0.0.112
//ssh -L 10001:localhost:10001 -L 10002:localhost:10002 -L 10003:localhost:10003 -L 10009:localhost:10009 liorefinkelsteien@10.0.0.112
