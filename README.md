Built with GitHub Copilot using GPT-4o

## To deploy to github pages

- After making changes run `npm run build` from the `/ootp-missions` folder
- run `git add -f dist` to commit the deployed changes. This seems needed due to a gitignore issue I haven't looked into.
- Commit and push the changes
- run `git subtree push --prefix ootp-missions/dist origin gh-pages` from the root folder

## To add new missions

- Update `/ootp-missions/src/data/missions.ts` with a new entry for each mission

## To run locally

- `npm run install`
- `npm run dev`

## Stash Notes

- `git stash list`
- `git stash apply stash@{0}`
- `git stash push -m "stash message"`
