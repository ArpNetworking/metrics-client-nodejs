/*
 * Copyright 2014 Groupon.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import tsdDef = require("tsdDef");
import log4js = require("log4js");
import events = require("events");
import _ = require("underscore");

import timers = require("./tsd-timer");
import counters = require("./tsd-counter");
import utils = require("./utils");
import timerSamples = require("./timer-samples");
import counterSamples = require("./counter-samples");
import units = require("./tsd-units");
import sample = require("./tsd-metric-sample");
import metricsList = require("./tsd-metrics-list");
import metricsEvent = require("./tsd-metrics-event");
import metricsFactory = require("./tsd-metrics-factory");
import metrics = require("./tsd-metrics");
import log4jsSink = require("./sinks/tsd-query-log-sink");
import consoleSink = require("./sinks/tsd-console-sink");
import sink = require("./sinks/tsd-sink");
import errors = require("./error-reporting");

//aliases
import TsdTimer = timers.TsdTimer;
import TsdCounter = counters.TsdCounter;
import Lazy = utils.Lazy;
import CounterSamples = counterSamples.CounterSamples;
import TimerSamples = timerSamples.TimerSamples;
import Units = units.Units;
import TsdMetricSample = sample.TsdMetricSample;
import TsdMetricsList = metricsList.TsdMetricsList;
import TsdMetricsEvent = metricsEvent.TsdMetricsEvent;
import TsdMetricsFactory = metricsFactory.TsdMetricsFactory
import TsdMetrics = metrics.TsdMetrics;

/**
 * The tsd module configuration parameters.
 * @ignore
 */
class Options {
    /* istanbul ignore next */
    constructor() {
    }

    /**
     * Sets the maximums size of log in bytes before rolling a new file.
     * Default: 32 MB
     * @type {number}
     */
    public static LOG_MAX_SIZE:number = 32 * 1024 * 1024;

    /**
     * Sets the maximum number of log files backup to retain.
     * Default: 10
     * @type {number}
     */
    public static LOG_BACKUPS:number = 10;

    /**
     * The name of the query log file
     * Default: "tsd-query.log"
     * @type {string}
     */
    public static LOG_FILE_NAME:string = "tsd-query.log";

    /**
     * Sets a flag to output the metrics to console in addition to the query file (mainly for testing).
     * Default: false
     * @type {boolean}
     */
    public static LOG_CONSOLE_ECHO:boolean = false;
}


/**
 * 'error' event. Emitted on errors or improper usage of API's
 *
 * @event TsdMetrics#error
 * @type {Error}
 */
/**
 * 'logEvent' event. Emitted after successful writing of the metric event to the query log file
 *
 * @event TsdMetrics.events()#logEvent
 * @type {object}
 * @property {Array.<{Object.<string, string>}>} annotations Array of hash annotations.
 * @property {Object.<string, number[]>} counters Array of {"counter" : [samples]} hashes.
 * @property {Object.<string, number[]>} timers Array of {"timer" : [samples]} hashes.
 * @property {Object.<string, number[]>} gauges Array of {"gauge" : [samples]} hashes.
 */

/**
 * Static class holding factory for built in sinks. See example in
 * [tsd-metrics-client.init]{@linkcode module:tsd-metrics-client~init}
 *
 * @class
 * @alias Sinks
 */
export class TsdSinks {
    /* istanbul ignore next */ //This is a static class
    constructor() {
    }

    /**
     * Create a sink that outputs metrics data to the a file with standard tsd query format
     *
     * @method
     * @param {string} filename The name of the query log file. Default: "tsd-query.log"
     * @param {number} maxLogSize The maximums size of log in bytes before rolling a new file. Default: 33554432 (32 MB)
     * @param {number} backups The maximum number of log files backup to retain. Default: 10
     * @returns {QueryLogSink}
     */
    public static createQueryLogSink(filename:string = "tsd-query.log", maxLogSize:number = 32 * 1024 * 1024, backups:number = 10):tsdDef.Sink {
        return log4jsSink.TsdQueryLogSink.createQueryLogger(filename, maxLogSize, backups);
    }

    /**
     * Create a sink that outputs metrics data to console
     *
     * @method
     * @returns {ConsoleSink}
     */
    public static createConsoleSink():tsdDef.Sink {
        return new consoleSink.TsdConsoleSink();
    }
}

/**
 * Initialize the tsd metrics library by setting the sinks to output metrics to. By default a query log sink is added
 * with it's default configuration, in case <code>init</code> wasn't called.
 *
 * @param {Sink[]} sinks Array of objects extending [Sink]{@linkcode Sink}
 * @deprecated Use a <code>MetricsFactory</code> instead.
 * @example
 * var tsd = require("tsd-metrics-client");
 * var util = require("util");
 * function MySink() {
 * }
 * util.inherits(MySink, tsd.Sink);
 * MySink.prototype.record = function (metricsEvent) {
 *      console.log(metricsEvent);
 * };
 * var mySink =  new MySink();
 * tsd.init([mySink, tsd.Sinks.createQueryLogSink(), tsd.Sinks.createConsoleSink()])
 */
function init(sinks:tsdDef.Sink[]) {
    metrics._globalSinks = sinks;
}

/**
 * Main modules for TSD Client
 * @module tsd-metrics-client
 */

/**
 * The tsd-metrics-client module configuration parameters. See {@link module:tsd-metrics-client}
 * @typedef {Object} options
 * @property {number} LOG_MAX_SIZE - Sets the maximum number of log files backup to retain. Default: 33554432 (32 MB)
 * @property {number} LOG_BACKUPS - Sets the maximum number of log files backup to retain. Default: 10
 * @property {string} LOG_FILE_NAME - The name of the query log file. Default: "tsd-query.log"
 * @property {string} LOG_CONSOLE_ECHO - Sets a flag to output the metrics to console in addition to the query file.
 */

/**
 * Set the global configuration of the tsd module. It should be specified once per application.
 * @param {options} [options] A hash that specifies the configuration parameters
 * @deprecated passing options to require is deprecated. You should use
 * [tsd-metrics-factory]{@linkcode module:tsd-metrics-factory} instead, to configure where to output the metrics
 * @alias module:tsd-metrics-client
 */
module.exports = function (options:any = {}) {
    if (typeof options.LOG_MAX_SIZE !== "undefined") {
        Options.LOG_MAX_SIZE = options.LOG_MAX_SIZE;
    }

    if (typeof options.LOG_BACKUPS !== "undefined") {
        Options.LOG_BACKUPS = options.LOG_BACKUPS;
    }

    if (typeof options.LOG_FILE_NAME !== "undefined") {
        Options.LOG_FILE_NAME = options.LOG_FILE_NAME;
    }

    if (typeof options.LOG_CONSOLE_ECHO !== "undefined") {
        Options.LOG_CONSOLE_ECHO = options.LOG_CONSOLE_ECHO;
    }
    var sinks = [TsdSinks.createQueryLogSink(
        Options.LOG_FILE_NAME,
        Options.LOG_MAX_SIZE,
        Options.LOG_BACKUPS)];

    if (Options.LOG_CONSOLE_ECHO) {
        sinks.push(TsdSinks.createConsoleSink());
    }
    init(sinks);

    return module.exports;
};

module.exports.Sinks = TsdSinks;
module.exports.TsdMetrics = TsdMetrics;
module.exports.TsdMetricsFactory = TsdMetricsFactory;
module.exports.Sink = sink.TsdSink;
module.exports.MetricsEvent = TsdMetricsEvent;
module.exports.Units = Units;
module.exports.init = init;
module.exports.onError = errors.onError;
