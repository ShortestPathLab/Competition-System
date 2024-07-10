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

extra_domains=(
  iron
)

function extract() {
  dst=$1
  from=$2
  domain=$3

  dstdir="$dst/${domain}"
  mkdir -p ${dstdir}

  zipp="${from}/${domain}-map.zip"
  unzip -n ${zipp} -d ${dstdir}

  zipp="${from}/${domain}-scen.zip"
  unzip -n ${zipp} -d ${dstdir}

  zipp="${from}/${domain}-pdf.zip"
  unzip -n ${zipp} -d ${dstdir}

  zipp="${from}/${domain}-png.zip"
  unzip -n ${zipp} -d ${dstdir}
}

function extract_all() {
  d="./benchmarks"
  from="./download"
  ext_from="./extra_benchmarks"

  for domain in ${domains[@]}; do
    echo "Extracting $domain ..."
    extract $d $from $domain
  done

  for domain in ${extra_domains[@]}; do
    echo "Extracting (extra) $domain ..."
    extract $d ${ext_from} $domain
  done
}

extract_all
