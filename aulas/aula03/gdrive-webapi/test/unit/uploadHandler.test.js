import { 
	describe,
	test,
	expect,
	beforeEach,
	jest
} from '@jest/globals';

import { resolve } from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';

import { logger } from './../../src/logger.js';
import Routes from './../../src/routes.js';
import UploadHandler from './../../src/uploadHandler.js';
import TestUtil from './../_util/testUtil.js';

describe('#UploadHandler test suite', () => {
	const ioObj = {
		to: (id) => ioObj,
		emit: (event, message) => {}
	}

	beforeEach(() => {
		// The logs created by logger will be disabled
		jest.spyOn(logger, 'info')
			.mockImplementation();
	});

	describe('#registerEvents', () => {
		test('should call onFile and onFinish functions on Busboy instance', () => {
			const uploadHandler = new UploadHandler({
				io: ioObj,
				socketId: '01'
			});	

			jest.spyOn(uploadHandler, uploadHandler.onFile.name)
				.mockResolvedValue();

			const headers = {
				'content-type': 'multipart/form-data; boundary='
			}

			const onFinish = jest.fn();

			const busboyInstance = uploadHandler.registerEvents(headers, onFinish);

			const fileStream = TestUtil.generateReadableStream(['chunk', 'of', 'data']);

			busboyInstance.emit('file', 'fieldname', fileStream, 'filename.txt');
			busboyInstance.listeners('finish')[0].call();

			expect(uploadHandler.onFile).toHaveBeenCalled();

			expect(onFinish).toHaveBeenCalled();
		});
	});	

	describe('#onFile', () => {
		test('given a stream file it should save it on disk', async () => {
			const chunks = ['hey', 'jude'];
			const downloadsFolder = '/tmp';

			const handler = new UploadHandler({
				io: ioObj,
				socketId: '01',
				downloadsFolder
			});

			const onData = jest.fn();

			jest.spyOn(fs, fs.createWriteStream.name)
				.mockImplementation(() => TestUtil.generateWritableStream(onData));

			const onTransform = jest.fn();

			jest.spyOn(handler, handler.handleFileBytes.name)
				.mockImplementation(() => TestUtil.generateTransformStream(onTransform));

			const params = {
				fieldname: 'video',
				file: TestUtil.generateReadableStream(chunks),
				filename: 'mockFile.mov'
			};

			await handler.onFile(...Object.values(params));

			expect(onData.mock.calls.join()).toEqual(chunks.join());
			expect(onTransform.mock.calls.join()).toEqual(chunks.join());
			
			const expectedFilename = `${handler.downloadsFolder}/${params.filename}`;
			expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFilename);
		});
	});

	describe('#handleFileBytes', () => {
		test('should call emit function and it is a transform stream', async () => {
			jest.spyOn(ioObj, ioObj.to.name);
			jest.spyOn(ioObj, ioObj.emit.name);

			const handler = new UploadHandler({
				io: ioObj,
				socketId: '01'
			});

			// For this test, canExecute always returns true and allows
			// the execution
			jest.spyOn(handler, handler.canExecute.name)
				.mockReturnValueOnce(true);

			const messages = ['hello'];
			const source = TestUtil.generateReadableStream(messages);

			const onWrite = jest.fn();
			const target = TestUtil.generateWritableStream(onWrite);

			await pipeline(
				source,
				handler.handleFileBytes("filename.txt"),
				target
			);

			expect(ioObj.to).toHaveBeenCalledTimes(messages.length);
			expect(ioObj.emit).toHaveBeenCalledTimes(messages.length);

			/*
				Testing if handleFileBytes is a transform stream

				- If the handleFileBytes is a transform stream, our pipeline will
				continue the process, passing the data forward and calling our function in target
				every chunk
			*/

			expect(onWrite).toHaveBeenCalledTimes(messages.length);
			expect(onWrite.mock.calls.join()).toEqual(messages.join());

		});

		test('given message timeDelay as 2secs it should emit only two messages during 2 seconds period', async () => {
			const filename = "filename.avi";

			jest.spyOn(ioObj, ioObj.emit.name);

			const twoSecondsPeriod = 2000;

			const day = '2021-09-08 01:01'

			const onFirstLastMessageSent = TestUtil.getTimeFromDate(`${day}:00`);

			const onFirstCanExecute = TestUtil.getTimeFromDate(`${day}:02`);

			const onSecondUpdateLastMessageSent = onFirstCanExecute;

			const onSecondCanExecute = TestUtil.getTimeFromDate(`${day}:03`);

			const onThirdCanExecute = TestUtil.getTimeFromDate(`${day}:04`);

			TestUtil.mockDateNow(
				[
					onFirstLastMessageSent,
					onFirstCanExecute,
					onSecondUpdateLastMessageSent,
					onSecondCanExecute,
					onThirdCanExecute
				]
			);

			const handler = new UploadHandler({
				io: ioObj,
				socketId: '01',
				messageTimeDelay: twoSecondsPeriod
			});

			const messages = ["hello", "world", "!!!"];

			const expectedMessageSent = 2;

			const source = TestUtil.generateReadableStream(messages);

			await pipeline(
				source,
				handler.handleFileBytes(filename)
			);

			expect(ioObj.emit).toHaveBeenCalledTimes(expectedMessageSent);

			const [firstCallResult, secondCallResult] = ioObj.emit.mock.calls;

			expect(firstCallResult).toEqual([handler.ON_UPLOAD_EVENT, {
				processedAlready: "hello".length,
				filename
			}]);

			expect(secondCallResult).toEqual([handler.ON_UPLOAD_EVENT, {
				processedAlready: messages.join('').length,
				filename
			}]);
		})
	});

	describe('#canExecute', () => {
		test('should return true when time is later than specified delay', () => {
			
			const timerDelay = 1000;

			const uploadHandler = new UploadHandler({
				io: {},
				socketId: '',
				messageTimeDelay: timerDelay
			});

			const tickNow = TestUtil.getTimeFromDate('2021-09-09 00:00:03');
			
			TestUtil.mockDateNow([tickNow]);

			const lastExecution = TestUtil.getTimeFromDate('2021-09-09 00:00:00');

			const result = uploadHandler.canExecute(lastExecution);

			expect(result).toBeTruthy();
		});

		test('should return false when time isnt later than specified delay', () => {

			const timerDelay = 3000;

			const uploadHandler = new UploadHandler({
				io: {},
				socketId: '',
				messageTimeDelay: timerDelay
			});

			const now = TestUtil.getTimeFromDate('2021-09-09 00:00:02');
			TestUtil.mockDateNow([now]);

			const lastExecution = TestUtil.getTimeFromDate('2021-09-09 00:00:01');

			const result = uploadHandler.canExecute(lastExecution);

			expect(result).toBeFalsy();
		});
	});
});