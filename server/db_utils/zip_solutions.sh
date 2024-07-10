# zip each file in ./best_solutions to a single zip file
# and put them in ./best_solutions_zipped

# create the directory if it doesn't exist
mkdir -p best_solutions_zipped

# zip each file in ./best_solutions to a single zip file
for file in best_solutions/test_round/*; do
  zip -j best_solutions_zipped/$(basename $file).zip $file
done

