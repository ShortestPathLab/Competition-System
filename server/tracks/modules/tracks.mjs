import fs from 'node:fs/promises';
import {default as config} from '#root/config.js';
import path from 'node:path';
import log from 'loglevel';
import { Version, TrackVersion, FileDatabase } from './versioning.mjs';
import TrackSubmission from './submission.mjs';

const VERSION_SUBDIR = 'versions';

export class Track {
	constructor(name) {
		/** @type {string} */
		this.name = name;
		/** @type {string} */
		this.path = undefined;
		/** @type {string} */
		this.git_https = undefined;
		/** @type {string} */
		this.file_version = undefined;
		/** @type {FileDatabase} */
		this.file_db = undefined;
		/** @type {TrackVersion[]} */
		this.versions = undefined;
		/** @type {Map<Version,TrackVersion>} */
		this.versions_map = undefined;
	}

	/**
	 * @param {(string|Version)} version Gets a specified version
	 * @returns {TrackVersion} The specific version of the track, or undefined if non exists
	 */
	get_version(version) {
		if (version instanceof Version) {
			version = version.toString();
		}
		return this.versions_map.get(version);
	}

	/**
	 * @returns {TrackVersion}
	 */
	get_version_latest() {
		return this.versions[0];
	}

	async load_track(path_dir) {
		this.path = path_dir;

		// load config
		try {
			let track_str = await fs.readFile(path.join(this.path, 'track.json'));
			let track_config = JSON.parse(track_str);

			// setup track info
			this.name = track_config.Name;
			this.git_https = track_config.GIT;
			this.file_version = track_config.FileVersion;

			// load all track versions
			const version_path = path.join(this.path, VERSION_SUBDIR);
			this.versions = [];
			this.versions_map = new Map();
			let await_versions = [];
			let dir;
			dir = await fs.opendir(version_path);
			for await (const trackVersion of dir) {
				if (trackVersion.isFile() && path.extname(trackVersion.name) == '.json') {
					// trackVersion is a config file
					let ver = new TrackVersion();
					this.versions.push(ver);
					await_versions.push(ver.load_config(this, path.join(version_path, trackVersion.name)));
				}
			}
			await Promise.all(await_versions);
			for (const ver of this.versions) {
				if (this.versions_map.has(ver)) {
					throw new Error(`duplicate version ${ver.version} in ${this.name}`);
				}
				this.versions_map.set(ver.version.toString(), ver);
			}
			this.versions.sort((a, b) => a.version > b.version);

			// setup version info
			this.file_db = new FileDatabase(this);
			for (const ver of this.versions) {
				for (const file_hash of ver.immutable_files) {
					this.file_db.add(file_hash);
				}
			}
		}
		catch (err) {
			log.error(`failed to load track from ${path_dir}: ${err}`);
			throw err;
		}
	}

	toString() {
		return this.name;
	}

	create_submission(submission_path) {
		submission_path = path.resolve(submission_path);
		return new TrackSubmission(this, submission_path);
	}
}

class TracksControl {
	constructor() {
		/** @type {Track[]} */
		this.tracks = undefined;
		/** @type {Map<string,Track>} */
		this.tracks_map = new Map();
	}

	/**
	 * @param {string} track_name 
	 * @returns {Track}
	 */
	get_track(track_name) {
		return this.tracks_map.get(track_name);
	}

	async _load_config() {
		if (this.tracks !== undefined) {
			log.warn('TracksControl._load_config called twice');
			return;
		}
		this.tracks = [];
		const config_file = path.join(config.tracks_dir, 'tracks.json');
		let config_str = await fs.readFile(config_file);
		let config_tracks = JSON.parse(config_str);

		let await_list = [];
		for (let track of config_tracks) {
			let tobj = new Track(track.Name);
			this.tracks.push(tobj);
			await_list.push(tobj.load_track(path.join(config.tracks_dir, track.Path)));
		}
		for (let track of this.tracks) {
			if (this.tracks_map.has(track.name)) {
				log.error(`duplicate track ${track.name}`);
				throw new Error('duplicate track');
			}
			this.tracks_map.set(track.name, track);
		}
		await Promise.all(await_list);
	}
}

const tracks = new TracksControl();
await tracks._load_config();

export default tracks;
