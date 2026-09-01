# push-and-merge.ps1

# Make sure we're on working and push it
git checkout working
git push origin working

# Switch to master, pull latest, merge working in
git checkout master
git pull origin master
git merge working
git push origin master

# Switch back to working so you can keep developing
git checkout working