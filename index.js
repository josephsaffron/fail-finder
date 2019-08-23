const AWS = require('aws-sdk');
const fetch = require('node-fetch');
//const credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
//AWS.config.credentials = credentials;
AWS.config.update({region: process.env.AWS_DEFAULT_REGION|| 'us-east-1'});
const ec2 = new AWS.EC2();
exports.handler =  async function(event, context) {
	const regions = await ec2.describeRegions().promise();
	const regionNames = regions.Regions.map( x=> x.RegionName );
	const failedStackInfo = [];
	for (let region of regionNames) {
		AWS.config.update({region});
		const cfn = new AWS.CloudFormation();
		const failedStacks = await cfn.listStacks({StackStatusFilter: [
			'CREATE_FAILED', 'ROLLBACK_FAILED', 'DELETE_FAILED',
		]}).promise();
		failedStackInfo.push( ...failedStacks.StackSummaries.map( x => `Failed Stack named ${x.StackName} in ${region} with status ${x.StackStatus}`));
	}
	const url = process.env.SLACK_HOOK_URL;
	const channel = process.env.SLACK_CHANNEL;
	if (failedStackInfo.length > 1) {
		await fetch(url, {  
			method: 'POST',
			 body: `${JSON.stringify({channel: `#${channel}`, username: "failfinder", text: failedStackInfo.join('\n'), icon_emoji: ":ghost:"})}`
		});
	}
	return;
}
