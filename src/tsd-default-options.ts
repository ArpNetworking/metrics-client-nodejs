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

/**
 * The tsd module configuration parameters.
 * @ignore
 */
export class Options {
    /* istanbul ignore next */
    constructor() {
    }

    /**
     * Sets the maximums size of log in bytes before rolling a new file.
     * Default: 100 MB
     * @type {number}
     */
    public static LOG_MAX_SIZE:number = 100 * 1024 * 1024;

    /**
     * Sets the maximum number of log files backup to retain.
     * Default: 20
     * @type {number}
     */
    public static LOG_BACKUPS:number = 20;

    /**
     * The name of the query log file
     * Default: "tsd-query.log"
     * @type {string}
     */
    public static LOG_FILE_NAME:string = "tsd-query.log";
}
