# Prepare maps and scenarios

* `./dl.sh`: download all movingai data, and stores in `download` folder
  * files names are in format `<domain>-map.zip` or `<domain>-scen.zip`, e.g. `dao-map.zip,dao-scen.zip`

* `./extract.sh`: extract all zip files to `benchmarks/`, files are organized by domains
  * e.g.

    ```bash
       tree benchmarks/da2
      benchmarks/da2
      ├── ca_cave.map
      ├── ca_cave.map.scen
    ```

* `./cleanup.sh`: remove unused maps from `stdin`
* `ignore.txt`: define the path of maps should be ignored.
* `gen_contest_data.py`: select subset of map and scenarios (query instances) such that:
  * each domain has similar distribution of `bucket_id` (i.e. similar difficulty), see more details in the next section;
  * each domain has 20k queries;
  * each selected map has at least 10 queries;

* All together:
  1. `./dl.sh`
  2. `./extract.sh`
  3. `./cleanup.sh < ignore.txt`
  4. `rm -rf contest`: 
    * remove previous generated data
    * because a map  was previously selected may not be selected in the next time
  5. `./gen_contest_data.py`


# How do we guarantee the similarity of distribution across domains
* Normalize:
  * assuming in each map, each bucket has exactly 10 queries;
  * generate tokens, which are tuple of `(domain, map, bucket_id)`), then `#token = #queries * 10`
  * using a larger bucket (the current bucket size is 4?) to tweak the resolution;
  * group all tokens by `domain`, then group by the new `bucket_id`;
  * for each domain `d`, and bucket `i` in `d`, randomly select some queries so that the size of same bucket in different domains are same.
