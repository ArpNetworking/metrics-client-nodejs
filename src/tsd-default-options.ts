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
