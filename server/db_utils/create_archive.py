import pandas as pd
import os
import json

submissions = pd.read_csv('submission_details_test.csv',doublequote=True, escapechar='\\')
# header of the csv: leaderboard,account_name,team_name,algorithm_name,submission_id,commit info,algorithm_description,team_members,affiliation,country,liscense,organisation_name,project_name,repo_ssh,

print(submissions.head())

# 10 instances
# instances = ["I-01", "I-02", "I-03", "I-04", "I-05", "I-06", "I-07", "I-08", "I-09", "I-10"]
instances = ["warehouse_large","sortation_large","random","brc202d","Paris"]
license_template_path = "./license_templates"
license_files = {
    "Please Select":"mit.txt",
    "MIT": "mit.txt",
    "AGPL3":"agpl3-header.txt",
    "APACHE":"apache-header.txt",
    "BSD3":"bsd3.txt",
    "CC0" :"cc0-header.txt",
    "EPL" :"epl.txt",
    "GPL3":"gpl3-header.txt",
    "GPL2":"gpl2.txt",
    "LGPL":"lgpl.txt",
    "MPL":"mpl-header.txt",
    "CC-BY-NC": "cc_by_nc-header.txt",
}
year = 2023
license_general = """
The files in this folder are licensed with two different licenses. 
The following files are licensed under the "LICENSE_ROBOT_RUNNER":
    Debug_and_Visualise_Your_Planner.md
    Input_Output_Format.md
    Prepare_Your_Planner.md
    RunInDocker.sh
    Submission_Instruction.md
    Working_with_Preprocessed_Data.md
    example_problems/*
    image/*
    inc/ActionModel.h
    inc/CompetitionSystem.h
    inc/Evaluation.h
    inc/Grid.h
    inc/Logger.h
    inc/SharedEnv.h
    inc/States.h
    inc/Tasks.h
    inc/common.h
    python/MAPFbinding.cpp
    python/pyEnvironment.hpp
    python/pyMAPFPlanner.cpp
    python/pyMAPFPlanner.hpp
    src/ActionModel.cpp
    src/CompetitionSystem.cpp
    src/Evaluation.cpp
    src/Grid.cpp
    src/Logger.cpp
    src/States.cpp
    src/common.cpp
    src/driver.cpp
    upgrade_start_kit.sh

All other files (if not separately stated in the file) are licensed under the "LICENSE_PARTICIPANT".
"""

license_robot_runner="""
MIT License

Copyright (c) 2022 The League of Robot Runners

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

summary = {}

for index, row in submissions.iterrows():
    if row["team_name"] not in summary:
        summary[row["team_name"]] = {"display_name": "Team_" + row["team_name"].replace(" ","_")}
    if "repo_ssh" not in summary[row["team_name"]]:
        summary[row["team_name"]]["repo_ssh"] = row["repo_ssh"]
    
    if "liscense" not in summary[row["team_name"]]:
        summary[row["team_name"]]["liscense"] = ""
        lic = license_files[row["liscense"]]
        
        with open(os.path.join(license_template_path, lic), "r") as f:
            summary[row["team_name"]]["liscense"] += f.read()
        
        summary[row["team_name"]]["liscense"] = summary[row["team_name"]]["liscense"].replace("{{ project }}", row["project_name"])
        summary[row["team_name"]]["liscense"] = summary[row["team_name"]]["liscense"].replace("{{ year }}", str(year))
        summary[row["team_name"]]["liscense"] = summary[row["team_name"]]["liscense"].replace("{{ organization }}", row["organisation_name"])
    
    if "entries" not in summary[row["team_name"]]:
        summary[row["team_name"]]["entries"] = []

    score = f"{row['score']}"
    score_details = row["score_details"]
    # print(score_details)
    # exit()
    summary[row["team_name"]]["entries"].append({
        "track": row["leaderboard"],
        "commit": row["commit info"].split(";")[0].split("commit ")[1].strip(),
        "submission_id": row["submission_id"],
        "score":round(float(score),3),
        "score_details": score_details
        })

print(summary)

# create a code archive for each team in a target folder
# using the repo_ssh to clone the code and copy the code of each commit to a folder
# keep only the source code without git history in the folder.
# each team will have a folder under the target folder with the following structure
# team_name
#   - README.md
#   - LICENSE
#   - [commit id 1] # a folder with the code of the commit
#   - [commit id 2]
#   -  ... ...
# The readme.md will contain the information about: the team_name, the content of the folder (which commit is for which track and link to the commit id folder)
# The target folder contains a README.md that lists the structure of the whole archive (with link to each team and each team's commits)

import os
import shutil

target_folder = "archive"
if os.path.exists(target_folder):
    shutil.rmtree(target_folder)
os.makedirs(target_folder)

# start = False
for team_name in summary:
    # if team_name == "Pikachu":
    #     start = True
    
    # if not start:
    #     continue

    team_folder = os.path.join(target_folder, summary[team_name]["display_name"])
    os.makedirs(team_folder)
    with open(os.path.join(team_folder, "README.md"), "a") as f:
        # f.write(f'# {summary[team_name]["display_name"]}\n')
        # f.write(f"## Entries:\n")
        # for entry in summary[team_name]["entries"]:
        #     f.write(f"- [commit {entry['commit']}]({entry['commit']}) - {entry['track']} - {entry['score']}\n")
        # create a html table version of the above information

        f.write(f"### Test Round:\n")
        f.write(f"<table>\n")
        f.write(f"<tr>\n")
        f.write(f"<th rowspan='2'>Track</th>\n")
        f.write(f"<th rowspan='2'>Score</th>\n")
        f.write(f"<th colspan='{len(instances)}'>Total Errands Finished</th>\n")
        f.write(f"<th rowspan='2'>Entries</th>\n")
        f.write(f"<th rowspan='2'>Submission ID</th>")

        f.write(f"</tr>\n")
        f.write(f"<tr>\n")
        for i in instances:
            f.write(f"<th>{i}</th>\n")
        f.write(f"</tr>\n")

        for entry in summary[team_name]["entries"]:
            score_details = entry["score_details"]
            json_score_details = json.loads(score_details)
            # print(json_score_details["I-01"]["my_metric"])
            # exit()            
            f.write(f"<tr>\n")
            f.write(f"<td>{entry['track']}</td>\n")
            f.write(f"<td>{entry['score']}</td>\n")
            for i in instances:
                f.write(f"<td>{(json_score_details[i]['my_metric'])}</td>\n")
            f.write(f"<td><a href='{entry['commit']}'>commit {entry['commit']}</a></td>\n")
            f.write(f"<td>{entry['submission_id']}</td>\n")
            f.write(f"</tr>\n")
        f.write(f"</table>\n")

    
    for entry in summary[team_name]["entries"]:
        commit_folder = os.path.join(team_folder, entry["commit"])
        # if exist skip the clone as multiple track share same code for this team
        if os.path.exists(commit_folder):
            continue
        
        os.system(f"git clone {summary[team_name]['repo_ssh']} '{commit_folder}'")
        os.system(f"cd '{commit_folder}' && git checkout {entry['commit']}")
        ## remove all files or folders start with "." (hidden files) under the root folder
        os.system(f"cd '{commit_folder}' && find . -name '.*' -exec rm -rf {'{}'} \;")

        #write license_general to LICENSE
        if not os.path.exists(commit_folder):
            os.makedirs(commit_folder)
        with open(os.path.join(commit_folder, "LICENSE"), "w") as f:
            f.write(license_general)
        
        #write license_robot_runner to LICENSE_ROBOT_RUNNER
        with open(os.path.join(commit_folder, "LICENSE_ROBOT_RUNNER"), "w") as f:
            f.write(license_robot_runner)
        
        #write the team's liscense to LICENSE_PARTICIPANT
        with open(os.path.join(commit_folder, "LICENSE_PARTICIPANT"), "w") as f:
            f.write(summary[team_name]["liscense"])
        
with open(os.path.join(target_folder, "README.md"), "a") as f:
    # f.write(f"# 2023 Main Round Code Archive\n")
    # f.write(f"## Teams and Entries:\n")
    teams = list(summary.keys())
    teams.sort()

    # create a table with the same contents from the aboving code
    # example header | Team | Entries | Track | Score |
    # merge cells vertically for the same team
    # as markdown do not support merge of cells, use html table
    f.write(f"### Test Round:\n")
    f.write(f"<table>\n")
    f.write(f"<tr>\n")
    f.write(f"<th rowspan='2'>Team</th>\n")
    f.write(f"<th rowspan='2'>Track</th>\n")
    f.write(f"<th rowspan='2'>Score</th>\n")
    f.write(f"<th colspan='{len(instances)}'>Total Errands Finished</th>\n")
    f.write(f"<th rowspan='2'>Entries</th>\n")
    f.write(f"<th rowspan='2'>Submission ID</th>")
    f.write(f"</tr>\n")
    f.write(f"<tr>\n")
    for i in instances:
        f.write(f"<th>{i}</th>\n")
    f.write(f"</tr>\n")
    for team_name in teams:
        display_name = summary[team_name]["display_name"]
        entries = summary[team_name]["entries"]


        f.write(f"<tr>\n")
        f.write(f"<td rowspan={len(entries)}><a href='{display_name}'>{display_name}</a></td>\n")
        for entry in entries:
            score_details = entry["score_details"]
            json_score_details = json.loads(score_details)
            f.write(f"<td>{entry['track']}</td>\n")
            f.write(f"<td>{entry['score']}</td>\n")
            for i in instances:
                f.write(f"<td>{json_score_details[i]['my_metric']}</td>\n")
            f.write(f"<td><a href='{display_name}/{entry['commit']}'>commit {entry['commit']}</a></td>\n")
            f.write(f"<td>{entry['submission_id']}</td>\n")
            f.write(f"</tr>\n")
    f.write(f"</table>\n")











    

