const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader')
const async = require('async');
var _ = require('lodash');

var ROUTE_PROTO_PATH = __dirname + '/route_guide.proto';
var packageDefinition = protoLoader.loadSync ( ROUTE_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true });

var routeguide = grpc.loadPackageDefinition (packageDefinition).routeguide;
var client = new routeguide.RouteGuide('localhost:50051', grpc.credentials.createInsecure());

/** 
* Run the getFeature demo.
* @param {function} callback Called when this demo is complete
*/

function runGetFeature(callback) {
    var next = _.after(1, callback);

    function featureCallback(error, feature) {
        if (error) {
            callback(error);
            return;
        }
        if (feature.name == '') {
            console.log('Found no feature at' + feature.location.latitude + ', ' + feature.location.longitude);
        } else {
            console.log('Found feature called "' + feature.name + '" at ' + feature.location.latitude + ', ' + feature.location.longitude);
        }
        next();
    }

    var req_point = {
        latitude: 0,
        longitude: 0
    }

    client.getFeature(req_point, featureCallback);
}

function main() {
    async.series( [runGetFeature]);
}

if (require.main === module) {
    main();
}

exports.runGetFeature = runGetFeature;

