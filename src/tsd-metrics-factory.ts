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

import events = require("events");
import tsdDef = require("tsdDef");
import tsdMetrics = require("./tsd-metrics");

import TsdMetrics = tsdMetrics.TsdMetrics;

/**
 * Factory pattern for creating and configuring instances of Metrics.
 *
 * @class
 * @author Matthew Hayter (mhayter at groupon dot com)
 */
export class TsdMetricsFactory implements tsdDef.MetricsFactory {
    private _sinks:tsdDef.Sink[];

    public constructor(sinks = []) {
        this._sinks = sinks;
    }

    public create():tsdDef.Metrics {
        return new TsdMetrics(this._sinks);
    }

    /**
     * Build a TsdMetrics factory with all default settings, requiring only those parameter for which no defaults exist.
     *
     * @param serviceName The name of the service producing the metrics, e.g. 'my-web-service' or 'workerbee'.
     * @param clusterName Name of the cluster to which the host belongs, e.g. 'my-kafka-cluster'.
     * @param directory The directory in which the metrics files will be created (with the default file name).
     */
    public static newInstance(serviceName:string, clusterName:string, directory:string):TsdMetrics  {
        // TODO
        return null;
    }
}
