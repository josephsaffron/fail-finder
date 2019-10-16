const kinesisFinder =  require('./src/kinesis');
const failedStacks = require('./src/failedStacks');
const logGroups = require('./src/logGroups');
const lambda = require('./src/lambda');
const runner = async function(){
	console.log('des');
	// await kinesisFinder(false, 'des');
	await failedStacks(null,null, 'des');
	//await lambda(false, 'des');
	console.log('pes')
	// await kinesisFinder(false, 'pes');
	await failedStacks(null,null, 'pes');
	//await lambda(false, 'pes');
	console.log('dest')
	// await kinesisFinder(false, 'dest');
	await failedStacks(null,null, 'dest');
	//await lambda(false, 'dest');
}
runner();