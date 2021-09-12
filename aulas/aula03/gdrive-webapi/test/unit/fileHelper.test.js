import { 
	describe,
	test,
	expect,
	jest
} from '@jest/globals';

import fs from 'fs';

import Routes from './../../src/routes.js';

import FileHelper from '../../src/fileHelper.js';

describe('#FileHelper', () => {
	
	describe('#getFileStatus', () => {
		test('it should return files statuses in correct format', async () => {

			const statMock =  {
				dev: 2483686410,
				mode: 33206,
				nlink: 1,
				uid: 0,
				gid: 0,
				rdev: 0,
				blksize: 4096,
				ino: 562949954236526,
				size: 3802,
				blocks: 8,
				atimeMs: 1630962832253.706,
				mtimeMs: 1629833876949.1765,
				ctimeMs: 1629833876949.1765,
				birthtimeMs: 1630962832091.7502,
				atime: '2021-09-06T21:13:52.254Z',
				mtime: '2021-08-24T19:37:56.949Z',
				ctime: '2021-08-24T19:37:56.949Z',
				birthtime: '2021-09-06T21:13:52.092Z'
			}

			const mockUser = 'someone_user';
			process.env.USER = mockUser;

			const filename = 'file.png';

			jest.spyOn(fs.promises, fs.promises.readdir.name)
				.mockResolvedValue([filename]);

			jest.spyOn(fs.promises, fs.promises.stat.name)
				.mockResolvedValue(statMock);

			const result = await FileHelper.getFilesStatus("/tmp");

			const expectedResult = [
				{
					size: '3.8 kB',
					lastModified: statMock.birthtime,
					owner: mockUser,
					file: filename
				}
			];	

			expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`);

			expect(result).toMatchObject(expectedResult);
		});
	});
});