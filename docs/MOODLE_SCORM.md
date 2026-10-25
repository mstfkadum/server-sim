# Putting the labs in Moodle (SCORM 1.2)

`node build-scorm.js` writes the packages to `dist/scorm/`:

- `cisco-c240-m4-lff-lab1-install.zip` ... `-lab13-os-esxi.zip`: one package per lab (and the same for
  `hpe-dl380-gen11-sff`, seven labs). Recommended: each lab becomes its
  own Moodle activity with its own grade, completion and access rules.
- `cisco-c240-m4-lff-all-labs.zip`: all thirteen labs in one activity, with a contents list to move between them.

Lab names, the pass mark and the points per mistake are set in `models/<id>/manifest.json` under `"scorm"`.

## How a lab is graded

- **Graded run:** guidance off from the first action to the end. Score = 100 minus 10 per mistake (never below 0).
  Passed at 70 or more, otherwise failed.
- **RAM Distributor exam:** guidance is locked off. An unsupported memory layout, or less capacity than the work order,
  scores 0 (failed). A supported layout scores 100 minus 10 per mistake, minus 20 if a faster layout was possible, 10 for
  more capacity than needed and 10 for more DIMMs than needed.
- **Practice run:** guidance was on at some point. Recorded as completed, with no score.
- The best result is kept: a practice run or a weaker graded run never lowers it.
- Moodle also gets the time spent, the step reached, and a note per run (date, graded or practice, mistakes, score).
- A student who leaves halfway comes back to the same step.

Inside Moodle the model and scenario menus are hidden. The header shows the lab name and whether the current run
is graded.

On a first launch the package opens with the How to use tour of the screen: the course bar, Guidance and the graded
or practice rule (with the package's own pass mark and points per mistake), progress, the step, the workbench and the
reference panels. It does not open when a saved run resumes, and **How to use** in the header opens it again. The tour
is not a lab action: it never turns a run into practice.

## Adding one lab

1. In the course, turn **Edit mode** on.
2. **Add an activity or resource** → **SCORM package**.
3. **Name:** for example "Lab 8: Replace a failed power supply". **Package file:** drag in the lab's zip.
4. **Appearance:**
   - Display package: **New window**, width 100%, height 100%. Or Current window with height 900.
   - Student skip content structure page: **Always**.
   - Display course structure in player: **Hidden**.
5. **Grade:**
   - Grading method: **Highest grade**.
   - Maximum grade: **100**.
6. **Attempts management:**
   - Number of attempts: **Unlimited**.
   - Attempts grading: **Highest attempt**.
   - Force new attempt: **No**.
7. **Completion conditions:**
   - Receive a grade.
   - Require status: **Passed**. Or "Completed" if practice runs should count.
8. **Save and display.** Check it as a student: profile menu → **Switch role to** → **Student**.

To open labs in order, set **Restrict access** on Lab 2 to "Activity completion: Lab 1 must be marked complete",
and so on.

## Updating a lab

Open the activity's settings, replace the package file with the new zip, and save. Attempts already made stay.
Try it on a copy of the course first.

## If something does not work

- **"Package file is invalid":** upload the lab's zip as it is. Do not unzip it, or zip it again.
- **The new window does not open:** allow pop-ups for the Moodle site, or use Display package: Current window.
- **No grade appears:** check that the run was done with guidance off. The lab header says "Graded run".
