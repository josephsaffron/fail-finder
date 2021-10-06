const AWS = require('aws-sdk');

const kinesisFinder =  require('./src/kinesis');
const failedStacks = require('./src/failedStacks');
const logGroups = require('./src/logGroups');
const lambda = require('./src/lambda');
const runner = async function(profile){
	console.log(profile);
	// await kinesisFinder(false, 'des');
	await failedStacks(null,null, profile);
}

//runner('dc');
AWS.config.update({region: 'ca-central-1'});
async function newGetTokens(){
	const SSM = new AWS.SSM({ apiVersion: '2014-11-06' });
	const ssmParams = {
		Names: ['RALLY_ENCODED_TOKEN', 'SLACK_ENCODED_TOKEN'],
		WithDecryption: true
	};
	const result = await SSM.getParameters(ssmParams).promise();
	console.log(result);
}

async function getToken(encodedText) {

	const cipherText = {
		CiphertextBlob: Buffer.from(encodedText, 'base64')
	};

	const kms = new AWS.KMS({ region: 'us-east-1' });
	const result = await kms.decrypt(cipherText).promise();

	console.log(result.Plaintext.toString('utf-8'));
}

const tokens = [
	'AQECAHgELwM0RMEHVoLdcsT+adfFnyR2+EL3I2oHXTcZKZV9MwAAAIswgYgGCSqGSIb3DQEHBqB7MHkCAQAwdAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAzqzAdni8yvPtZi50ECARCAR4ccEkUeqJYr/mLkW0ta4Zok4UlPQW4kaXoHq9mdU5wHirFJb1ONaxpPr+vlS475ZTcPZmQQ2Akt/ufQUF3YASarze22x5fn',
	'AQECAHgELwM0RMEHVoLdcsT+adfFnyR2+EL3I2oHXTcZKZV9MwAAAHYwdAYJKoZIhvcNAQcGoGcwZQIBADBgBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDHP5JT2qPEzJCLNL6wIBEIAzgTyeQMn0yPxftacl/bljJRngEAg5ExNU7dFTVmpJSkFJhYaREcThtJheEOIfs1EurBM9'];
async function newGetTokens(){
	const SSM = new aws.SSM({ apiVersion: '2014-11-06' });
	const ssmParams = {
		Names: ['RALLY_ENCODED_TOKEN', 'SLACK_ENCODED_TOKEN'],
		WithDecryption: true
	};
	return await SSM.getParameters(ssmParams).promise();
}
getToken(tokens[0]);
getToken(tokens[1]);