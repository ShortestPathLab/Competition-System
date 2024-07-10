#!/bin/bash

domains=(
dao
da2
bg512
sc1
street
room
random
maze
)
host="https://movingai.com/benchmarks/"
d="./download/"

function dl() {
  # e.g.
  # https://movingai.com/benchmarks/dao/dao-map.zip
  # https://movingai.com/benchmarks/dao/dao-scen.zip
  # https://movingai.com/benchmarks/dao/dao-pdf.zip
  # https://movingai.com/benchmarks/dao/dao-png.zip
  domain=$1
  url_map="${host}${domain}/${domain}-map.zip"
  url_scen="${host}${domain}/${domain}-scen.zip"
  url_pdf="${host}${domain}/${domain}-pdf.zip"
  url_png="${host}${domain}/${domain}-png.zip"
  mkdir -p $d

  cmd="wget ${url_map} -P $d"
  [ ! -f "$d/${domain}-map.zip" ] && eval $cmd

  cmd="wget ${url_scen} -P $d"
  [ ! -f "$d/${domain}-scen.zip" ] && eval $cmd

  cmd="wget ${url_pdf} -P $d"
  [ ! -f "$d/${domain}-pdf.zip" ] && eval $cmd

  cmd="wget ${url_png} -P $d"
  [ ! -f "$d/${domain}-png.zip" ] && eval $cmd
}

function dl_all() {
  for domain in ${domains[@]}; do
    echo "Downloading $domain ..."
    dl $domain
    sleep 1
  done
}

dl_all
