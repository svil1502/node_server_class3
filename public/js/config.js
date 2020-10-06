"use strict";

// Загружает настройки и предоставляет к ним доступ
class Config {

	constructor() {
		this.filename = undefined;
		this.imgdir = './img/';
		this.videodir = './video/';
		this.videotimeout = 300;
		this.err = false;
		this.background1 = './background/level2.png';
		this.background2 = './background/level2.png';
		this.background3 = './background/level2.png';
		this.background4 = './background/level2.png';
	}
	
	load() {
		let _config = undefined;
		try {
			_config = require(this.filename);
		} catch (e) {
			this.err = true;
			if (process.env.NODE_ENV === 'test') {
				console.log(e);
			}
			return;
		}

		if (process.env.NODE_ENV === 'test') {
			console.dir(this.filename);
			console.dir(_config);
		}
		if (_config.imgdir !== undefined) {
			this.imgdir = _config.imgdir;
		} else {
			this.err = true
		}
			
		if (_config.videodir !== undefined) {
			this.videodir = _config.videodir;
		} else {
			this.err = true
		}

		if (_config.videotimeout !== undefined) {
			this.videotimeout = _config.videotimeout;
		} else {
			this.err = true
		}

		if (_config.background1 !== undefined) {
			this.background1 = _config.background1;
		} else {
			this.err = true
		}

		if (_config.background2 !== undefined) {
			this.background2 = _config.background2;
		} else {
			this.err = true
		}

		if (_config.background3 !== undefined) {
			this.background3 = _config.background3;
		} else {
			this.err = true
		}

		if (_config.background4 !== undefined) {
			this.background4 = _config.background4;
		} else {
			this.err = true
		}
	}
}

module.exports = Config;
