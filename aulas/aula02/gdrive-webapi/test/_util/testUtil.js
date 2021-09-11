// Jest
import { jest } from '@jest/globals';

// Node.js
import { Readable, Writable, Transform } from 'stream';

export default class TestUtil {
	static mockDateNow(mockImplementationPeriods) {
		const now = jest.spyOn(global.Date, global.Date.now.name);

		mockImplementationPeriods.forEach(time => {
			// 00:00
			// 00:01
			// 00:02
			// 00:03
			// etc.

			now.mockReturnValueOnce(time);
		});
	}

	static getTimeFromDate(dateString) {
		return new Date(dateString).getTime();
	}

	static generateReadableStream(data) {
		return new Readable({
			objectMode: true,
			read() {
				for(const item of data) {
					this.push(item);
				}

				// Para informar que a Readable Stream acabou, adicionamos null ao array
				this.push(null);
			}
		});
	}

	static generateWritableStream(onData) {
		return new Writable({
			objectMode: true,
			write(chunk, encoding, callback) {
				onData(chunk);

				callback(null, chunk);
			}
		});
	}

	static generateTransformStream(onData) {

		/*
			async function* asyncIterator(source) {
				for await(const chunk of source) {
					yield chunk;
				}
			}
		*/

		return new Transform({
			objectMode: true,
			transform(chunk, encoding, callback) {
				onData(chunk);

				callback(null, chunk);
			}
		});
	}
}