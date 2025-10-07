import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AutoTradeApi implements ICredentialType {
	name = 'autotradeApi';
	displayName = 'AutoTrade Credentials API';

	documentationUrl = 'https://autotrade-pro.com/blog';

	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: 'http://127.0.0.1:5555',
			placeholder: 'http://127.0.0.1:5555',
			description: 'Base URL of your AutoTrade backend',
		},
		{
			displayName: 'Token',
			name: 'token',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Bearer token for AutoTrade API',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.token}}',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.host}}',
			url: '/api/robots',
			method: 'GET',
		},
	};
}
