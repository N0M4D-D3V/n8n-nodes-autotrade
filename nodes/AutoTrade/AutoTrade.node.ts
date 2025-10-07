import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

export class AutoTrade implements INodeType {
	description: INodeTypeDescription = {
		icon: 'file:icon.svg',
		displayName: 'AutoTrade',
		name: 'autoTrade',
		group: ['transform'],
		version: 1,
		description: 'Control AutoTrade from n8n',
		defaults: { name: 'AutoTrade' },
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'autotradeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Host',
				name: 'host',
				type: 'string',
				default: 'http://127.0.0.1:5555',
				description: 'Base URL of AutoTrade backend',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Run Robot',
						value: 'runRobot',
						description: 'Executes an specific robotization',
						action: 'Executes an specific robotization',
					},
					{
						name: 'Kill',
						value: 'kill',
						description: 'Switch off AutoTrade',
						action: 'Switch off auto trade',
					},
				],
				default: 'runRobot',
			},
			// runRobot
			{
				displayName: 'Robot Name',
				name: 'robotName',
				type: 'string',
				default: '',
				placeholder: 'my_robot',
				displayOptions: { show: { operation: ['runRobot'] } },
			},
			{
				displayName: 'Extra Kwargs (JSON)',
				name: 'extraKwargs',
				type: 'json',
				default: {},
				displayOptions: { show: { operation: ['runRobot'] } },
			},
		],
	};

	methods = {
		loadOptions: {
			async loadRobots(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				// 👉 host: credenciales > parámetro del nodo
				const creds = (await this.getCredentials('autotradeApi')) as unknown as {
					host?: string;
					token?: string;
				} | null;

				const paramHost = (this.getNodeParameter('host', 0) as string) || '';
				const base = (paramHost || creds?.host || 'http://127.0.0.1:5555').replace(/\/+$/, '');

				// Usa la helper con auth para que añada el Bearer automáticamente
				const res = await this.helpers.httpRequestWithAuthentication!.call(this, 'autotradeApi', {
					method: 'GET',
					url: `${base}/api/robots`,
					json: true,
				});

				const list = Array.isArray(res) ? res : ((res as any)?.robots ?? []);
				if (!Array.isArray(list)) {
					throw new NodeOperationError(this.getNode(), 'Unexpected /api/robots response format');
				}
				return list.map((r) => ({ name: r, value: r }));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Carga credenciales una vez
		const creds = (await this.getCredentials('autotradeApi')) as unknown as {
			host?: string;
			token?: string;
		} | null;

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				const paramHost = (this.getNodeParameter('host', i, '') as string) || '';
				const base = (paramHost || creds?.host || 'http://127.0.0.1:5555').replace(/\/+$/, '');

				let actionVal = '';
				if (operation === 'runRobot') actionVal = 'run_robot';
				else if (operation === 'kill') actionVal = 'kill';
				else
					throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`, {
						itemIndex: i,
					});

				const kwargs: Record<string, unknown> = {};
				if (operation === 'runRobot') {
					const name = this.getNodeParameter('robotName', i) as string;
					if (name) kwargs.name = name;
					const extra = this.getNodeParameter('extraKwargs', i, {}) as Record<string, unknown>;
					Object.assign(kwargs, extra);
				}

				const requestOptions: IHttpRequestOptions = {
					method: 'POST',
					url: `${base}/api/action`,
					body: { action: actionVal, kwargs },
					json: true,
					// No pongas headers aquí: los añade la credencial
				};

				// 🔐 Llama con autenticación: inyecta `Authorization: Bearer <token>`
				const response = await this.helpers.httpRequestWithAuthentication!.call(
					this,
					'autotradeApi',
					requestOptions,
				);

				returnData.push({ json: (response ?? {}) as JsonObject });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message } as JsonObject,
						pairedItem: i,
					});
					continue;
				}
				if ((error as any)?.response) {
					throw new NodeApiError(this.getNode(), error as any, { itemIndex: i });
				}
				throw new NodeOperationError(this.getNode(), (error as Error).message, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
