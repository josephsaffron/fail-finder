const flatMap = require('flatmap');
const fetch = require('node-fetch');
//const credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
//AWS.config.credentials = credentials;

module.exports = async function(event, context, profile) {
	const AWS = require('aws-sdk');
	const credentials = new AWS.SharedIniFileCredentials({profile});
	AWS.config.credentials = credentials;
	AWS.config.update({region: 'us-east-1', credentials: credentials} );
	const ec2 = new AWS.EC2();

	const regions = await ec2.describeRegions().promise();
	const regionNames = regions.Regions.map( x=> x.RegionName );
	const failedStackInfo = [];
	for (let region of regionNames) {
		try {
			AWS.config.update({region});
			const cfn = new AWS.CloudFormation();
			const failedStacks = await cfn.listStacks({StackStatusFilter: [
				'CREATE_FAILED', 'ROLLBACK_FAILED', 'DELETE_FAILED',
				//'CREATE_COMPLETE', 'UPDATE_COMPLETE'
			]}).promise();
			//failedStackInfo.push( ...failedStacks.StackSummaries.map( x => `Stack named ${x.StackName} in ${region} with status ${x.StackStatus}`));
			if (failedStacks.StackSummaries.length > 0){
				console.log(region);
				failedStacks.StackSummaries.forEach( x=> console.log(x.StackName));
			}
			const ec2 = new AWS.EC2();
			const ec2Instances = await ec2.describeInstances().promise();
			console.log( ...flatMap(ec2Instances.Reservations, x=> x.Instances ).map( x=> `EC2 Instance named ${x.ImageId} running in ${x.Placement.AvailabilityZone}\n`));
		} catch(err) {
			console.log(`error with region ${region}`);
			//console.log(err);
		}
	}
	const url = process.env.SLACK_HOOK_URL;
	const channel = process.env.SLACK_CHANNEL;
	if (failedStackInfo.length > 1) {
		// await fetch(url, {  
		// 	method: 'POST',
		// 	 body: `${JSON.stringify({channel: `#${channel}`, username: "failfinder", text: failedStackInfo.join('\n'), icon_emoji: ":ghost:"})}`
		// });
		console.log(failedStackInfo);
	}
	return;
}