/**
 * Add configurations for the application here
 */

 var environments = {};

 environments.staging = {
	 httpPort: 3000,
	 httpsPort: 3001,
	 environmentName: 'staging'
 }

 environments.production = {
	 httpPort: 5000,
	 httpsPort: 5001,
	 environmentName: 'production'
 }

 var providedEnv = typeof process.env.ENV === 'string' ? process.env.ENV.toLowerCase() : '';

 var envToExport = providedEnv in environments ? environments[providedEnv] : environments['staging'];

 module.exports = envToExport;