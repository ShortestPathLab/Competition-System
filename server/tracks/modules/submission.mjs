import fs from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import path from 'node:path';
import log from 'loglevel';
import { Version, FileHash, get_file_hash } from './versioning.mjs';

export default class TrackSubmission {
	constructor(track, path) {
		/** @type {import('./tracks.mjs').Track} */
		this.track = track;
		/** @type {string} */
		this.path = path;
		/** @type {Version} */
		this.version = undefined;
	}

	async load_version_info() {
		if (this.version === undefined) {
			let buf = Buffer.alloc(128);
			let file;
			try {
				file = await fs.open(path.join(this.path, this.track.file_version), 'r');
				const len = (await file.read(buf, 0, 128)).bytesRead;
				if (len >= 128) {
					this.version = null;
					log.warn(`version file "${path.join(this.path, this.track.file_version)}" too big`);
				} else {
					this.version = new Version(buf.toString());
				}
			}
			catch (err) {
				this.version = null;
			}
			finally {
				file?.close();
			}
		}
		return this.version;
	}

	/**
	 * Check's folders for inconsistencies with version immutables.
	 * @param {Version} [version] check specific version for file differences, if not given use submissions determined version, if found
	 * @param {boolean} [strict=false] also compare file's content on same sha256 hash
	 * @returns {?FileHash[]} returns array of FileHash that differ, or null if version could not be determined
	 */
	async check_invalid_files(version, strict=false) {
		if (version === undefined) {
			version = await this.load_version_info();
		}
		let vtrack = this.track.get_version(version);
		if (vtrack === undefined) {
			return null;
		}
		let checks = [];
		for (const file_hash of vtrack.immutable_files) {
			const file_path = path.join(this.path, file_hash.path);
			checks.push(vtrack.files_are_same(file_hash, file_path, strict));
		}
		checks = await Promise.all(checks);
		let differ = [];
		for (let i in checks) {
			if (!checks[i]) {
				differ.push(vtrack.immutable_files[i]);
			}
		}
		return differ;
	}
}
