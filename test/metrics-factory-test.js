var fs = require('fs');

var tsd = require("../lib/tsd-metrics-client");
var assert = require("chai").assert;

describe('Metrics Factory', function () {
    var defaultFilename = "./query.log";

    var testSinkOutput = null;
    var testSink = {record: function(output) {
        testSinkOutput = output;
    }};
    var loggerOutput = null;
    var testLogger = {info: function(s) {
        loggerOutput = s;
    }};

    beforeEach(function() {
        testSinkOutput = null;
        loggerOutput = null;
    });

    it("uses a warning sink when missing cluster name", function() {

        var metricsFactory = tsd.TsdMetricsFactory.buildInstance({
            serviceName: "someService",
            // Missing cluster name
            //clusterName: "someCluster",
            hostName: "someHost",
            sinks: [testSink],
            logger: testLogger
        });

        var metrics = metricsFactory.create();
        metrics.incrementCounter("testCounter");
        metrics.close();

        assert.isNull(testSinkOutput);
        assert.isNotNull(loggerOutput);
        assert.include(loggerOutput, "metrics disabled");
    });

    it("uses a warning sink when missing service name", function() {
        var metricsFactory = tsd.TsdMetricsFactory.buildInstance({
            // Missing service name
            //serviceName: "someService",
            clusterName: "someCluster",
            hostName: "someHost",
            sinks: [testSink],
            logger: testLogger
        });

        var metrics = metricsFactory.create();
        metrics.incrementCounter("testCounter");
        metrics.close();

        assert.isNull(testSinkOutput);
        assert.isNotNull(loggerOutput);
        assert.include(loggerOutput, "metrics disabled");
    });

    it("retrieves the hostname from the system when not provided", function() {
        var metricsFactory = tsd.TsdMetricsFactory.buildInstance({
            serviceName: "someService",
            clusterName: "someCluster",
            //hostName: "someHost",
            sinks: [testSink],
            logger: testLogger
        });

        var metrics = metricsFactory.create();
        metrics.incrementCounter("testCounter");
        metrics.close();

        assert.isNull(loggerOutput);
        assert.isNotNull(testSinkOutput);
        assert.isNotNull(testSinkOutput.annotations._host, "Hostname not found in metrics event");
    });

    it("uses a default sink when sinks are not provided", function() {
        var metricsFactory = tsd.TsdMetricsFactory.buildInstance({
            serviceName: "someService",
            clusterName: "someCluster",
            hostName: "someHost",
            logger: testLogger
        });

        var metrics = metricsFactory.create();
        metrics.incrementCounter("testCounter");
        metrics.close();

        assert.isNull(loggerOutput);
    });

    it("can be created with defaults via 'newInstance()", function(done) {
        // Remove the default query.log file on disk
        fs.unlink(defaultFilename, function(err) {
            // Ignore any error
            var metricsFactory = tsd.TsdMetricsFactory.newInstance("someService", "someCluster", "./");
            assert.isNotNull(metricsFactory);

            var metrics = metricsFactory.create();
            metrics.incrementCounter("newInstanceTestCounter");
            metrics.close();

            // Wait for the query.log to be written
            setTimeout(function () {
                fs.readFile(defaultFilename, {encoding: "utf8"}, function(err, data) {
                    assert.include(data, "newInstanceTestCounter");
                    done();
                })
            }, 1);
        });
    });

    it("can be handed a default query logger sink", function(done) {
        // Remove the default query.log file on disk
        fs.unlink(defaultFilename, function(err) {
            var sink = tsd.Sinks.createQueryLogSink();
            // Ignore any error
            var metricsFactory = tsd.TsdMetricsFactory.buildInstance({serviceName: "someService", clusterName: "someCluster", sinks: [sink]});

            var metrics = metricsFactory.create();
            metrics.incrementCounter("defaultSinkTestCounter");
            metrics.close();

            // Wait for the query.log to be written
            setTimeout(function () {
                fs.readFile(defaultFilename, {encoding: "utf8"}, function(err, data) {
                    assert.include(data, "defaultSinkTestCounter");
                    done();
                })
            }, 1);
        });
    })
});
