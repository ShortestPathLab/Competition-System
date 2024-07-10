#!/bin/bash

while read -r map_path;
do
  [[ -f ${map_path} ]] && rm ${map_path} && echo "rm ${map_path}"
  [[ -f "${map_path}.scen" ]] && rm "${map_path}.scen" && echo "rm ${map_path}.scen"
done < /dev/stdin
