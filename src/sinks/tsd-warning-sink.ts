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

import tsdDef = require("tsdDef");
import log4js = require("log4js");
import utils = require("../utils");
import metricsSample = require("../tsd-metric-sample");
import tsdSink = require("./tsd-sink");
/**
 * Implementation of [Sink]{@linkcode Sink} to standard the query log file. For an example of its
 * use please refer to the documentation for See {@link module:tsd-metrics-client#init}.
 *
 * @class
 * @alias QueryLogSink
 * @author Mohammed Kamel (mkamel at groupon dot com)
 * @ignore
 */
export class TsdWarningSink implements tsdDef.Sink {
    private _warning:string;
    private _logger:log4js.Logger;
    constructor(logger:log4js.Logger, warnings:string[]) {
        this._logger = logger;
        this._warning = ["Unable to record event, metrics disabled; reasons:"].concat(warnings).join("\n");
    }

    record(metricsEvent:tsdDef.MetricsEvent):void {
        this._logger.info(this._warning)
    }
}
