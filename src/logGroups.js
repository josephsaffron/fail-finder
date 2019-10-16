const fetch = require('node-fetch');
module.exports = async function( postToSlack, profile ) {
	const AWS = require('aws-sdk');
	const credentials = new AWS.SharedIniFileCredentials({profile});
	AWS.config.credentials = credentials;
	AWS.config.update({region: 'us-east-1', credentials: credentials} );
	const ec2 = new AWS.EC2();
	const regions = await ec2.describeRegions().promise();
	const regionNames = regions.Regions.map( x=> x.RegionName );
	const alertInfo = [];
	for (let region of regionNames) {
		AWS.config.update({region});
		const log = new AWS.CloudWatchLogs();
		const logGroups = await log.describeLogGroups().promise();
		const groups = logGroups.logGroups
			// .filter(
			// 	x => x.logGroupName.indexOf('cr0') >= 0 
			// 		|| x.logGroupName.indexOf('sample') >= 0
			// 		|| x.logGroupName.indexOf('hello') >= 0
			// 		|| x.logGroupName.indexOf('US108124') >= 0
			// 	) 
			.map( x=> {
				return {logGroupName: x.logGroupName}
			});
		console.log(region);
		groups.forEach( async x => {
				//await log.deleteLogGroup(x).promise();
				console.log(x);
			});
		alertInfo.push(...groups);
		
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
	
	return;
}