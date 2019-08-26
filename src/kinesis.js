const AWS = require('aws-sdk');
const fetch = require('node-fetch');
//const credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
//AWS.config.credentials = credentials;
AWS.config.update({region: process.env.AWS_DEFAULT_REGION || 'us-east-1'});
const ec2 = new AWS.EC2();
module.exports = async function() {
	const regions = await ec2.describeRegions().promise();
	const regionNames = regions.Regions.map( x=> x.RegionName );
	const failedStackInfo = [];
	for (let region of regionNames) {
		AWS.config.update({region});
		const kinesis = new AWS.Kinesis();
		const kinesisStacks = await kinesis.listStreams().promise();
		failedStackInfo.push( ...kinesisStacks.StreamNames.map( x => `Kinesis Stream named ${x} running in ${region}`));
	}
	const url = process.env.SLACK_HOOK_URL;
	const channel = process.env.SLACK_CHANNEL;
	const account = process.env.AWS_ACCOUNT_NAME;
	if (failedStackInfo.length > 1) {
		await fetch(url, {  
			method: 'POST',
			 body: `${JSON.stringify({channel: `#${channel}`, username: "KinesisWatcher", text: `${account}:\n ${failedStackInfo.join('\n')}`, icon_emoji: ":ghost:"})}`
		});
	}
	return;
}