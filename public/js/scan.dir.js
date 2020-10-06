"use strict";

const fs = require('fs');
const path = require('path');
const LineDir = require('../js/line.dir');

class ScanDir {
	
	// Интерфейс класса ///////////////////////////////////////////////////////////////////////
	constructor(cfg) {
		this._cfg = cfg;
		this._array = [];
		this._array_video = [];
		this._delLinkImg = "";
	}

	// сканирование и обработка каталога
	rescanDir() {
		let pathImg = path.resolve(this._cfg.imgdir);
		let index = pathImg.lastIndexOf('\\');
		this._delLinkImg = pathImg.substring(0,index);

		this._array = [];
		this._scan();
		this._groupImage();
		this._removeErrorArray();
		this._normalizationArray();
		this._setNoImage();
		
		this._array_video = [];
		this._scan_video(this._cfg.videodir);
	}

	// поучение всего массива
	get arrayDir() {
		return this._array;
	}

	// поучение всего массива
	get videoDir() {
		//return this._array_video;
	}

	// получение первого уровня
	firstDir() {
		return this._array;
	}

	secondDirForIndex(index) {
		return this.arrayDir[index].array;
	}

	thirdDirForIndex(index1, index2) {
		return this.arrayDir[index1].array[index2].array;
	}

	// получение элемента по пути
	secondDir(path_name) {
		let result = undefined;
		// Первый уровень, группы
		this._array.forEach(function(item, i, arr) {
			if (item.path === path_name)
				result = item;
			// Второй уровень, группы
			item.array.forEach(function(item, i, arr) {
				if (item.path === path_name)
					result = item;
				// Третий уровень, шарики
				item.array.forEach(function(item, i, arr) {
					if (item.path === path_name)
						result = item;
				})
			})
		})

		return result;
	}

	// Получение основной картинки шарика в третьем уровне
	getMainImg(path_name) {
		let item = this.secondDir(path_name);
		if (item === undefined)
			return undefined;

		let result = undefined;
		item.array.forEach(function(item, i, arr) {
			if (item.name === 'group')
				result = item;
		});

		return result;
	}

	// Получение дополнительных картинок шариков в третьем уровне

	getArrayImg(path_name) {
		let item = this.secondDir(path_name);
		if (item === undefined)
			return [];

		let result = [];
		item.array.forEach(function(item, i, arr) {
			if (item.name !== 'group')
				result.push(item);
		});

		return result;
	}

	getVideoArray() {
		return this._array_video;
	}

	// Реализация класса ///////////////////////////////////////////////////////////////////////
	// запуск сканирования каталога
	_scan() {
		this._array = [];
		let line = new LineDir();
		line.array = this._array;
		this._scanOneDir(this._cfg.imgdir, line);
	}

	// рекурсивное сканирование каталога
	_scanOneDir(dir, line_array) {

		let items = undefined;
		let name = undefined;
		items = fs.readdirSync(dir);

		for (let i = 0; i < items.length; i++) {
			let line = new LineDir();
			line.path = path.resolve(dir + items[i]);

			try {
				let stats = fs.statSync(line.path);
				if (stats.isDirectory()) {
					line.isDir = true;
				}
			} catch (e) {
				console.log(e);
				return;
			}

			if (line.isDir) {
				name = items[i];
				line.path += path.sep;

				line.name = name.split(',')[0];
				line.price = name.split(',')[1];
			} else {
				line.img = line.path;
				line.ext = path.extname(items[i])
				name = path.basename(items[i], line.ext);
				line.ext = line.ext.substring(line.ext.lastIndexOf('.')+1);

				line.name = name.split(',')[0];
				line.price = name.split(',')[1];
			}

			if (line.name === undefined)
				line.name = "";
			else
				line.name = line.name.trim();

			if (line.price === undefined)
				line.price = "";
			else
				line.price = line.price.trim();

			line_array.array.push(line);
			if (line.isDir === true) {
				this._scanOneDir(line.path, line);
			}

		}
	}

	// парсинг клавиш
	_normalizationArray() {
		let _this = this;
		// Первый уровень, группы
		// добавить клавиши
		this._array.forEach(function(item, i, arr) {
			_this._parseKey(item);
			_this._addLink(item);

			// Второй уровень, группы
			// добавить клавиши
			item.array.forEach(function(item, i, arr) {
				_this._parseKey(item);
				_this._addLink(item);

				// Третий уровень, шарики
				// добавить клавиши
				item.array.forEach(function(item, i, arr) {
					_this._parseKey(item);
					_this._addLink(item);
				})
			})
		})
	}

	//Удаление некорректных записей, первый и второй только директории, третий только файлы
	_removeErrorArray() {
		// Первый уровень
		for (let i1 = this._array.length - 1; i1 >= 0; i1--) {
			if (this._array[i1].isDir === false){
				this._array.splice(i1, 1);
			} else {
				// Второй уровень
				for (let i2 = this._array[i1].array.length - 1; i2 >= 0; i2--) {
					if (this._array[i1].array[i2].isDir === false) {
						this._array[i1].array.splice(i2, 1);
					} else {
						// Третий уровень
						for (let i3 = this._array[i1].array[i2].array.length - 1; i3 >= 0; i3--) {
							if (this._array[i1].array[i2].array[i3].isDir === true) {
								this._array[i1].array[i2].array.splice(i3, 1);
							} else {
								this._array[i1].array[i2].array[i3].array = [];
							}
						}
					}
				}
			}
		}
	}

	// Выделение имени и номера клавиши
	_parseKey(line) {
		let pos = line.name.indexOf('.');
		if (pos !== -1) {
			line.key = line.name.slice(0, pos).trim();
			line.name = line.name.slice(pos+1).trim();
		} else {
			line.key = '';
			line.name = line.name.trim();
		}
	}

	// Перенос картинки группы в img группы
	_groupImage() {
		let path_1 = undefined;
		let path_2 = undefined;
		// Первый уровень
		for (let i1 = this._array.length - 1; i1 >= 0; i1--) {
			// Второй уровень
			path_1 = undefined;
			for (let i2 = this._array[i1].array.length - 1; i2 >= 0; i2--) {
				if (this._array[i1].array[i2].name === 'main') {
					path_1 = this._array[i1].array[i2].path;
					this._array[i1].array.splice(i2, 1);
				} else {
					// Третий уровень
					path_2 = undefined;
					for (let i3 = this._array[i1].array[i2].array.length - 1; i3 >= 0; i3--) {
	
						if (this._array[i1].array[i2].array[i3].name === 'main') {
							path_2 = this._array[i1].array[i2].array[i3].path;
							this._array[i1].array[i2].array.splice(i3, 1);
						}
					};
	
					if (path_2 !== undefined)
						this._array[i1].array[i2].img = path_2;
				}
			};
			
			if (path_1 !== undefined)
				this._array[i1].img = path_1;
		}
	}

	_setNoImage() {
		let img_path = path.resolve(this._cfg.imgdir + 'no-image.png');

		// Первый уровень
		// заполняем пустой картинкой
		this._array.forEach(function (item1, i1, arr1) {
			if (item1.img === '')
				item1.img = img_path;

			// Второй уровень
			// заполняем пустой картинкой
			item1.array.forEach(function (item2, i2, arr2) {
				if (item1.img === '')
					item1.img = img_path;

				// Третий уровень
				// проверяем на наличие левой и правой картинки
				let group = false;
				item2.array.forEach(function (item3, i3, arr3) {
					if (item3.name === 'group')
						group = true;
				});
				// Если нет левой картинки
				if (!group) {
					let line = new LineDir();
					line.name = 'group';
					line.img = img_path;
					item2.array.push(line);
				}
				// Если нет правой картинки
				if (item2.array.length === 1) {
					let line = new LineDir();
					line.name = 'no_image';
					line.img = img_path;
					item2.array.push(line);
				}
			});
		})
	}

	_addLink(item) {
		if ( item.img ) {
			item.link = item.img.replace(this._delLinkImg, '');
		}
	}
	
	_scan_video(dir) {
		let pathdir = undefined;

		let items = fs.readdirSync(dir);
		for (let i = 0; i < items.length; i++) {
			pathdir = path.resolve(dir + items[i]);
			try {
				let stats = fs.statSync(pathdir);
				if (stats.isDirectory()) {
					this._scan_video(pathdir);
				}
			} catch (e) {
				console.log(e);
				return;
			}

			this._array_video.push(pathdir);
		}
	}

	getIndexForName(index1, index2, name) {

		let ar = undefined;
		let index = undefined;

		// оиск в первом уровне
		if (index1 === undefined){
			ar = this.arrayDir;
		} else if (index2 === undefined) {
			ar = this.arrayDir[index1].array;
		} else {
			ar = this.arrayDir[index1].array[index2].array;
		}

		ar.forEach(function (item, i, arr) {
			if (item.name === name) {
				index = i;
			}
		});

		return index;
	}
}

module.exports = ScanDir;
