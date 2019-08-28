const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const flatMap = require('flatmap');
//const credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
//AWS.config.credentials = credentials;


AWS.config.update({region: process.env.AWS_DEFAULT_REGION || 'us-east-1'});
const ec2 = new AWS.EC2();
module.exports = async function( postToSlack ) {
	const regions = await ec2.describeRegions().promise();
	const regionNames = regions.Regions.map( x=> x.RegionName );
	const alertInfo = [];
	for (let region of regionNames) {
		AWS.config.update({region});
		const kinesis = new AWS.Kinesis();
		const kinesisStacks = await kinesis.listStreams().promise();
		alertInfo.push( ...kinesisStacks.StreamNames.map( x => `Kinesis Stream named ${x} running in ${region}`));
		const ec2 = new AWS.EC2();
		const ec2Instances = await ec2.describeInstances().promise();
		alertInfo.push( ...flatMap(ec2Instances.Reservations, x=> x.Instances ).map( x=> `EC2 Instance named ${x.KeyName} running in ${x.Placement.AvailabilityZone}`));
	}

	const url = process.env.SLACK_HOOK_URL;
	const channel = process.env.SLACK_CHANNEL || 'idp-hulk';
	const account = process.env.AWS_ACCOUNT_NAME || 'DevHulk';
	if (alertInfo.length > 1 && postToSlack) {
		await fetch(url, {  
			method: 'POST',
			 body: `${JSON.stringify({channel: `#${channel}`, username: "Watcher", text: `${account}:\n ${alertInfo.join('\n')}`, icon_emoji: ":ghost:"})}`
		});
	}
	console.log(alertInfo);
	return;
}