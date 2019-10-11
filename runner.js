const kinesisFinder =  require('./src/kinesis');
const failedStacks = require('./src/failedStacks');
const runner = async function(){
	console.log('des');
	await kinesisFinder(false, 'des');
	await failedStacks(null,null, 'des');
	console.log('pes')
	await kinesisFinder(false, 'pes');
	await failedStacks(null,null, 'pes');
	console.log('dest')
	await kinesisFinder(false, 'dest');
	await failedStacks(null,null, 'dest');
}
runner();