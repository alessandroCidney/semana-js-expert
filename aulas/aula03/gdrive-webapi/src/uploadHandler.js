import Busboy from 'busboy';

import { logger } from './logger.js';

import { pipeline } from 'stream/promises';
import fs from 'fs';

export default class UploadHandler {
	constructor({ io, socketId, downloadsFolder, messageTimeDelay=200 }) {
		this.io = io;
		this.socketId = socketId;
		this.downloadsFolder = downloadsFolder;
		this.ON_UPLOAD_EVENT = 'file-upload';
		this.messageTimeDelay = messageTimeDelay;
	}

	canExecute(lastExecution) {
		// canExecute prevents the excessive execution 
		// of handleData/handleFileBytes in production mode

		/* backPressure! */

		return (Date.now() - lastExecution) >= this.messageTimeDelay; // true or false
	}

	handleFileBytes(filename) {
		this.lastMessageSent = Date.now();

		async function* handleData(source) {

			let processedAlready = 0;

			for await(const chunk of source) {
				yield chunk;
				
				processedAlready += chunk.length;

				if(!this.canExecute(this.lastMessageSent)) {
					continue;
				}

				this.lastMessageSent = Date.now();

				this.io.to(this.socketId).emit(this.ON_UPLOAD_EVENT, {
					processedAlready,
					filename
				});

				logger.info(`File [${filename}] got ${processedAlready} bytes to ${this.socketId}`);

			}
		}

		return handleData.bind(this);
	}

	async onFile(fieldname, file, filename) {
		const saveTo = `${this.downloadsFolder}/${filename}`

		await pipeline(
			// 1º - Pegar a readable stream
			file,
			// 2º - Filtrar, converter e transformar os dados
			this.handleFileBytes.apply(this, [ filename ]),
			// 3º - Saída do processo: Writable Stream
			fs.createWriteStream(saveTo)
		);

		logger.info(`File [${filename}] finished`);
	}

	registerEvents(headers, onFinish) {
		const busboy = new Busboy({ headers });

		busboy.on("file", this.onFile.bind(this));
		busboy.on("finish", onFinish);

		return busboy;
	}
}