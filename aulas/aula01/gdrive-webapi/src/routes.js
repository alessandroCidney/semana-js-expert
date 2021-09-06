import FileHelper from './fileHelper.js';

import { logger } from './logger.js';

import { dirname, resolve } from 'path';

import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const defaultDownloadsFolder = resolve(__dirname, '../', 'downloads');

export default class Routes {
	io
	constructor(downloadsFolder=defaultDownloadsFolder) {
		this.downloadsFolder = downloadsFolder;

		this.fileHelper = FileHelper;
	}

	setSocketInstance(io) {
		this.io = io;
	}

	async defaultRoute(request, response) {
		response.end('hello world');
	}

	// Options geralmente é invocado pelo browser para testar a API
	async options(request, response) {
		response.writeHead(204);
		response.end();
	}

	async post(request, response) {
		logger.info('post route');
		response.end('hello world');
	}

	async get(request, response) {
		const files = await this.fileHelper.getFilesStatus(this.downloadsFolder);

		response.writeHead(200);

		response.end(JSON.stringify(files));
	}

	handler(request, response) {
		response.setHeader('Acess-Control-Allow-Origin', '*');

		// Selecionando o método a ser chamado ou a rota padrão
		const chosen = this[request.method.toLowerCase()] || this.defaultRoute

		// Chamando o método escolhido
		return chosen.apply(this, [request, response]);
	}
}