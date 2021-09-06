import { 
	describe,
	test,
	expect,
	jest
} from '@jest/globals';

import Routes from './../../src/routes.js';

describe('#Routes test suite', () => {
	const defaultParams = {
		request: {
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			method: '',
			body: {}
		},
		response: {
			setHeader: jest.fn(),
			writeHead: jest.fn(),
			end: jest.fn()
		},
		values: () => Object.values(defaultParams)
	}

	describe('#setSocketInstance', () => {
		test('setSocket should store io instance', () => {
			const routes = new Routes();

			const ioObj = {
				// to é um método que recebe um id e retorna o próprio ioObj
				to: (id) => ioObj,

				// emit geralmente é usado para enviar mensagens
				emit: (event, message) => {}
			};

			routes.setSocketInstance(ioObj);

			// Para testar se setSocketInstance realmente setou o ioObj como o io de routes
			expect(routes.io).toStrictEqual(ioObj);
		});
	});

	describe('#handler', () => {
		test('given an inexistent route it should choose default route', async () => {
			const routes = new Routes();

			const params = {
				...defaultParams
			};

			params.request.method = 'inexistent';

			await routes.handler(...params.values());

			expect(params.response.end).toHaveBeenCalledWith('hello world');
		});

		test('it should set any request with CORS enabled', async () => {
			const routes = new Routes();

			const params = {
				...defaultParams
			};

			params.request.method = 'inexistent';

			await routes.handler(...params.values());

			expect(params.response.setHeader)
				.toHaveBeenCalledWith('Acess-Control-Allow-Origin', '*');
		});


		test('given method OPTIONS it should choose options route', async () => {
			const routes = new Routes();

			const params = {
				...defaultParams
			};

			params.request.method = 'OPTIONS';

			await routes.handler(...params.values());

			expect(params.response.writeHead).toHaveBeenCalledWith(204);
			expect(params.response.end).toHaveBeenCalled();
		});

		test('given method POST it should choose post route', async () => {
			const routes = new Routes();

			const params = {
				...defaultParams
			};

			params.request.method = 'POST';

			// Com esse jest.spyOn, ignoramos o que o método POST faz internamente
			jest.spyOn(routes, routes.post.name).mockResolvedValue();

			await routes.handler(...params.values());

			expect(routes.post).toHaveBeenCalled();
		});

		test('given method GET it should choose get route', async () => {
			const routes = new Routes();

			const params = {
				...defaultParams
			};

			params.request.method = 'GET';

			// Com esse jest.spyOn, ignoramos o que o método GET faz internamente
			jest.spyOn(routes, routes.get.name).mockResolvedValue();

			await routes.handler(...params.values());

			expect(routes.get).toHaveBeenCalled();
		});
	});

	describe('#get', () => {
		test('given method GET it should list all files downloaded', async () => {
			const routes = new Routes();

			const params = {
				...defaultParams
			};

			const fileStatusesMock = [
				{
					size: '3.8 kB',
					lastModified: '2021-09-06T21:13:52.092Z',
					owner: "someone_user",
					file: "file.txt"
				}
			];

			jest.spyOn(routes.fileHelper, routes.fileHelper.getFilesStatus.name)
				.mockResolvedValue(fileStatusesMock);

			params.request.method = 'GET';

			await routes.handler(...params.values());

			expect(params.response.writeHead).toHaveBeenCalledWith(200);

			expect(params.response.end).toHaveBeenCalledWith(JSON.stringify(fileStatusesMock));
		});
	});
});