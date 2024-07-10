import fs from 'node:fs/promises';
import path from 'node:path';
import log from 'loglevel';
const { createHash } = await import('node:crypto');

const VERSION_MINORS = 100; // supports 100 revision numbers
const VERSION_MAJORS = VERSION_MINORS * 100; // supports 100 minor revision numbers

export class Version {
	constructor(major, minor, revision) {
		if (minor === undefined) {
			let vars = major.split('.');
			this.major = parseInt(vars[0], 10);
			this.minor = parseInt(vars[1], 10);
			this.revision = parseInt(vars[2], 10);
		} else {
			this.major = major;
			this.minor = minor;
			this.revision = revision;
		}
		this.index = this.major * VERSION_MAJORS + this.minor * VERSION_MINORS + this.revision;
		this.full = `${this.major}.${this.minor}.${this.revision}`;
	}

	toString() {
		return this.full;
	}
	// added to support proper sorting
	toValue() {
		return this.index;
	}
}

export class FileHash {
	constructor(path, size, sha256, version) {
		this.path = path;
		this.size = size;
		this.sha256 = sha256;
		this.version = version;
	}

	toString() {
		return `${this.path}//${this.size}/${this.sha256}`;
	}
}

export function file_list_hash(...fileHashes) {
	fileHashes.sort((a, b) => a.path < b.path);
	sha = createHash('sha256');
	for (const f of fileHashes) {
		sha.update(`${f}\0`);
	}
	return sha.digest('base64');
}

/**
 * Immutable database, not complete but still created. WIP
 */
export class FileDatabase {
	/**
	 * A database for immutable files.
	 * @param {import('./tracks.mjs').Track} track
	 */
	constructor(track) {
		/** @type {import('./tracks.mjs').Track} */
		this.track = track;
		/** @type {Map<string,TrackVersion[]} */
		this.files = new Map();
		/** @type {Map<string,TrackVersion[]} */
		this.files_hash = new Map();
	}

	/**
	 * 
	 * @param {FileHash} file_hash 
	 */
	add(file_hash) {
		this._add_map(this.files, file_hash.path, file_hash);
		this._add_map(this.files_hash, file_hash.sha256, file_hash);
	}

	/**
	 * 
	 * @param {Map<string,TrackVersion[]} map 
	 * @param {string} key 
	 * @param {TrackVersion} file_hash 
	 */
	_add_map(map, key, file_hash) {
		if (map.has(key)) {
			map.get(key).push(file_hash);
		} else {
			map.set(key, [file_hash]);
		}
	}

	get_file(filename) {
		return this.files.get(filename);
	}
	get_hash(sha256) {
		return this.files_hash.get(sha256);
	}

	/**
	 * Sort files and files_hash entries by inverse version.
	 */
	optimize() {
		this._optimize_map(this.files);
		this._optimize_map(this.file_hash);
	}

	/**
	 * 
	 * @param {Map<string,TrackVersion[]} map 
	 */
	_optimize_map(map) {
		for (let file_hashes of map.values()) {
			file_hashes.sort((a, b) => a.version > b.version);
		}
	}
}

/**
 * Class containing information of a specific version for a specific track.
 */
export class TrackVersion {
	constructor() {
		/** @type {Version} version */
		this.version = undefined;
		/** @type {import('./tracks.mjs').Track} */
		this.track = undefined;
		/** @type {string} */
		this.path = undefined;
		/** @type {FileHash[]} */
		this.immutable_files = undefined;
		/** @type {FileHash[]} */
		this.mutable_files = undefined;
		/** @type {FileHash[]} */
		this.tracking_files = undefined;
		/** @type {FileHash} */
		this.version_file = undefined;
	}

	/**
	 * Loads the track information for specific version as specified in version config file.
	 * @param {import('./tracks.mjs').Track} track the root path of this track
	 * @param {string} version_file the version config file, paths within config are relative to track_path
	 * @returns 
	 */
	async load_config(track, version_file) {
		if (this.track !== undefined) {
			log.warn('TrackVersion.load_config loaded twice');
			return;
		}
		this.track = track;
		try {
			// load config
			let version_str = await fs.readFile(version_file);
			let version_config = JSON.parse(version_str);

			// parse config
			this.version = new Version(version_config.Version);
			this.path = path.join(track.path, version_config.Path);
			this.tag = version_config.Tag;
			this.git_https = version_config.GIT;
			this.immutable_files = await this._config_create_hash_list(version_config.FilesImmutable);
			this.mutable_files = await this._config_create_hash_list(version_config.FilesMutable);
			this.tracking_files = 'FilesTracking' in version_config ? await this._config_create_hash_list(version_config.FilesTracking) : [];
			this.version_file = await this._config_create_hash_list([version_config.FileVersion])[0];
		}
		catch (err) {
			log.error(`failed to load version config "${version_file}"`);
			throw err;
		}
	}

	/**
	 * Converts list of filename into a list of Version object information on those files.  Performs error checking.
	 * @param {Object[]} files list of files to convert
	 * @returns {FileHash[]} converted file Version information
	 */
	async _config_create_hash_list(files) {
		let hashes = [];
		for (const file of files) {
			hashes.push(TrackVersion.create_file_hash(this.path, file.Path, file.Size, file.SHA256, this.version));
		}
		return await Promise.all(hashes);
	}

	static normalize_path(rel_path) {
		if (rel_path.includes('..')) {
			throw Error(`file "${rel_path}" cannot contain ".."`);
		}
		return path.normalize(rel_path);
	}

	static async create_file_hash(root_path, rel_path, size, sha256, version) {
		let file_path = TrackVersion.normalize_path(rel_path);
		const stats = await fs.stat(path.join(root_path, file_path));
		if (!stats.isFile()) {
			throw Error(`"${rel_path}" is not a file`);
		}
		return new FileHash(file_path, size, sha256, version);
	}

	/**
	 * Check's if a file in this TrackVersion is the same as a specific file on system
	 * @param {FileHash} version_file file in version to check
	 * @param {string} file_to_check file outside version to compare against
	 * @param {boolean} [strict=false] if enabled, if file-size and hash's match, then compare file content
	 */
	async files_are_same(version_file, file_to_check, strict=false) {
		try {
			const stat = await fs.stat(file_to_check);
			if (!stat.isFile() || stat.size != version_file.size) {
				return false;
			}
		}
		catch (err) {
			if (err.code === 'ENOENT') {
				return false;
			}
			throw err;
		}
		const sha256 = await get_file_hash(file_to_check);
		if (sha256 != version_file.sha256) {
			return false;
		}
		if (strict) {
			// load both files to memory and compare
			const version_file_buffer = await fs.readFile(path.join(this.path, version_file.path));
			const file_to_check_buffer = await fs.readFile(file_to_check);
			if (version_file_buffer.compare(file_to_check_buffer) != 0) {
				return false;
			}
		}
		return true;
	}
}

/**
 * Async hashes a file to default hashing algorithm SHA-256.
 * @param {string} filename the file to hash
 * @returns {string} hex-string of sha256 hash of filename
 */
export async function get_file_hash(filename) {
	const hash = createHash('sha256');
	const file = await fs.open(filename, 'r');
	const fileToHash = file.createReadStream();
	fileToHash.pipe(hash);
	return new Promise( (resolve, reject) => {
		hash.on('readable', () => {
			const data = hash.read();
			if (data) {
				resolve(data.toString('hex'));
			} else {
				reject();
			}
		});
		hash.on('error', (err) => {
			reject(err);
		});
	} );
}
