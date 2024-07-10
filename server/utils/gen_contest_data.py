#!/bin/python
import pandas as pd
import os
import json
from shutil import copyfile



header = ["bucket_id", "map", "h", "w", "sx", "sy", "tx", "ty", "ref_dist"]
domains = ["dao", "da2", "sc1", "street", "room", "random", "iron", "maze", "bg512"]
info = {
    "map": [],
    "domain": [],
    "label": []
}

def load_scen(fname, domain):
    df = pd.read_csv(fname, skiprows=1, sep='\t', header=0, names=header)
    df['domain'] = domain
    # iron harvest is using A* #expansion for bucket_id
    # while other domains are using ref_dist
    #  if (domain == 'iron'):
    #      df['bucket_id'] = df['ref_dist'] // 4
    return df

def load_all_scen():
    dfs = []
    for domain in domains:
        dir = "./benchmarks/{0}/".format(domain)
        for path in os.listdir(dir):
            if path.endswith(".map"):
                info["map"].append(path)
                info["domain"].append(domain)
                info["label"].append("default")
            if path.endswith(".scen"):
                df = load_scen(os.path.join(dir, path), domain)
                dfs.append(df)
    tot = pd.concat(dfs)
    return tot

def normalize(tot: pd.DataFrame, scale: int = 5):
    """
    make the distributioh of bucket similar across domains
    """

    tokens = tot.groupby(['map', 'bucket_id', 'domain']).size().to_frame().reset_index().rename(columns={0: 'num'})
    # ignore broken bucket
    tokens = tokens[tokens.num == 10]
    while True:
        dfs = []
        tokens['bid'] = tokens['bucket_id'] // scale
        domains = tokens.groupby('domain').groups.keys()

        for bid, bgr in tokens.groupby('bid'):
            dgrps: pd.core.groupby.DataFrameGroupBy = bgr.groupby('domain')
            # the scale is not large enough, there is a domain has no such bucket size
            # stop and try a larger scale
            if len(dgrps.groups.keys()) != len(domains):
                scale += 1
                break
            dsize = dgrps.size().min()
            for domain, dgrp in dgrps:
                dgrp: pd.DataFrame = dgrp
                df = dgrp.sample(dsize, random_state=2021)
                dfs.append(df)
        print('scale: ', scale)
        return pd.concat(dfs)

def select(tokens: pd.DataFrame, tot: pd.DataFrame, num: int = 2000):
    ts = []
    grps = tokens.groupby('domain')
    for domain, grp in grps:
        ts.append(grp.sample(num, random_state=2021, replace=True))

    t = pd.concat(ts)

    t.set_index(['map', 'domain', 'bucket_id'], inplace=True)
    tot.set_index(['map', 'domain', 'bucket_id'], inplace=True)
    selected = tot[tot.index.isin(t.index)]
    return selected

def write(selected: pd.DataFrame):

    # write scens
    scens = selected.reset_index().groupby(['map', 'domain'])
    for key, df in scens:
        mapname, domain = key
        df = df.drop(columns='domain')
        df = df[['bucket_id', 'map', 'h', 'w', 'sx', 'sy', 'tx', 'ty', 'ref_dist']]
        rows = df.to_csv(header=False, index=False, sep='\t')
        filename = mapname + '.scen'
        dir = "./contest/scenarios"
        if not os.path.exists(dir):
            os.makedirs(dir)
        path = os.path.join(dir, filename)
        print("Write to %s, %d rows" % (path, df.shape[0]))
        with open(path, "w") as f:
            f.write('version 1\n' + rows)

    # write maps
    keys = scens.groups.keys()
    mapdir = "./contest/maps"
    if not os.path.exists(mapdir):
        os.makedirs(mapdir)
    for mapname, domain in keys:
        src = "./benchmarks/{0}/{1}".format(domain, mapname)
        dst = "./contest/maps/{0}".format(mapname)
        copyfile(src, dst)
    info_df = pd.DataFrame.from_dict(info)
    info_df.sort_values(by=["domain", "map"]).to_csv(
            "./contest/meta-info.csv", index=False, columns=["label", "domain", "map"])


def main():
    tot = load_all_scen()
    tokens = normalize(tot)
    selected = select(tokens, tot)
    write(selected)

if __name__ == "__main__":
    main()
