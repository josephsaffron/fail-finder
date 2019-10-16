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
		const lambda = new AWS.Lambda();
		const lFunctions = await lambda.listFunctions().promise();

		const fns = lFunctions.Functions
			// .filter(
			// 	x => x.FunctionName.indexOf('cr0') >= 0 
			// 		|| x.FunctionName.indexOf('sample') >= 0
			// 		|| x.FunctionName.indexOf('hello') >= 0
			// 		|| x.FunctionName.indexOf('US108124') >= 0
			// 	) 
			.map( x=> {
				return {functionName: x.FunctionName}
			});
		
		if (fns.length > 0) {
			console.log(region);
		}
		fns.forEach( async x => {
				//await log.deleteLogGroup(x).promise();
				console.log(x);
			});
		// alertInfo.push(...groups);
		
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