/*
 * Copyright 2016 Groupon.com
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

import os = require("os");
import path = require("path");

import log4js = require("log4js");

import events = require("events");
import tsdDef = require("tsdDef");
import tsdMetrics = require("./tsd-metrics");
import options = require("./tsd-default-options");
import log4jsSink = require("./sinks/tsd-query-log-sink");
import consoleSink = require("./sinks/tsd-console-sink");
import warningSink = require("./sinks/tsd-warning-sink");
import hostResolvers = require("./tsd-host-resolvers");

import TsdMetrics = tsdMetrics.TsdMetrics;
import Options = options.Options;

/**
 * Factory pattern for creating and configuring instances of Metrics.
 *
 * @class
 * @author Matthew Hayter (mhayter at groupon dot com)
 */
export class TsdMetricsFactory implements tsdDef.MetricsFactory {
    private _serviceName:string;
    private _clusterName:string;
    private _hostResolver:tsdDef.HostResolver;
    private _sinks:tsdDef.Sink[];
    private _logger:log4js.Logger;

    /**
     * Build an instance of <code>TsdMetricsFactory</code> by providing the full configuration.
     *
     * @returns {TsdMetricsFactory}
     */
    public static buildInstance(options: {serviceName:string; clusterName:string; hostName?:string; hostResolver?:tsdDef.HostResolver; sinks?:tsdDef.Sink[]; logger?:log4js.Logger}):TsdMetricsFactory {
        var failures:string[] = [];
        var serviceName = options.serviceName;
        var clusterName = options.clusterName;
        var hostResolver = options.hostResolver;
        var sinks = options.sinks;
        var logger = options.logger;

        if (clusterName == null) {
            failures.push("clusterName must be provided");
        }
        if (serviceName == null) {
            failures.push("serviceName must be provided");
        }
        if (hostResolver == null) {
            if (options.hostName != null) {
                hostResolver = new hostResolvers.StaticHostnameSupplier(options.hostName)
            } else {
                hostResolver = new hostResolvers.StaticHostnameSupplier(os.hostname());
            }
        }
        if (sinks == null) {
            sinks = [this.buildDefaultSink("./")]
        }
        if (logger == null) {
            logger = log4js.getLogger("tsd-client")
        }

        if (failures.length > 0) {
            sinks = [new warningSink.TsdWarningSink(logger, failures)];
        }
        return new TsdMetricsFactory(serviceName, clusterName, hostResolver, sinks, logger);
    }

    /**
     * Build a TsdMetrics factory with all default settings, requiring only those parameter for which no defaults exist.
     *
     * @param serviceName The name of the service producing the metrics, e.g. 'my-web-service' or 'workerbee'.
     * @param clusterName Name of the cluster to which the host belongs, e.g. 'my-kafka-cluster'.
     * @param directory The directory in which the metrics files will be created (with the default file name).
     */
    public static newInstance(serviceName:string, clusterName:string, directory:string):TsdMetricsFactory {
        // Get the host
        var hostname = os.hostname();
        // Create a default file sink
        var defaultSink = this.buildDefaultSink(directory);
        return TsdMetricsFactory.buildInstance({serviceName: serviceName, clusterName: clusterName, sinks: [defaultSink]});
    }

    public create():tsdDef.Metrics {
        return new TsdMetrics(this._serviceName, this._clusterName, this._hostResolver, this._sinks);
    }

    private static buildDefaultSink(directory) {
        return DefaultSinks.createQueryLogSink(
            path.join(directory, Options.LOG_FILE_NAME),
            Options.LOG_MAX_SIZE,
            Options.LOG_BACKUPS);
    }

    /*
    For internal use only. Use static methods to build the TsdMetricsFactory.
     */
    constructor(serviceName:string, clusterName:string, hostResolver:tsdDef.HostResolver, sinks:tsdDef.Sink[], loggger:log4js.Logger) {
        this._serviceName = serviceName;
        this._clusterName = clusterName;
        this._hostResolver = hostResolver;
        this._sinks = sinks;
        this._logger = loggger;
    }
}

/**
 * Static class holding factory for built in sinks. See example in
 * [tsd-metrics-client.init]{@linkcode module:tsd-metrics-client~init}
 *
 * @class
 * @alias Sinks
 */
export class DefaultSinks {
    /* istanbul ignore next */ // This is a static class
    constructor() {
    }

    /**
     * Create a sink that outputs metrics data to the a file with standard tsd query format
     *
     * @method
     * @param {string} filename The name of the query log file. Default: "query.log"
     * @param {number} maxLogSize The maximums size of log in bytes before rolling a new file. Default: 33554432 (32 MB)
     * @param {number} backups The maximum number of log files backup to retain. Default: 10
     * @returns {QueryLogSink}
     */
    public static createQueryLogSink(filename:string = Options.LOG_FILE_NAME, maxLogSize:number = Options.LOG_MAX_SIZE, backups:number = Options.LOG_BACKUPS):tsdDef.Sink {
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
