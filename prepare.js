'use strict';

// on publish this script will check all docs projects and versions and prepare static data
// so it does not have to be generated using complicated logic from liquid templates / jekyll

const fs = require('fs')
const jsonfile = require('jsonfile');
const path = require('path')
const semverSort = require('semver-sort');

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory());
}
// collect all docs projects
const data = [];
const projects = getDirectories(`${ __dirname }/docs`);
projects.forEach(project => {

  const channels = ['latest', 'stable', 'beta', 'alpha'];
  const unsorted = getDirectories(`${ __dirname }/docs/${ project }`);

  // sort versions
  let sorted = [];

  // specific channels first
  channels.forEach((tag) => {
    unsorted.indexOf(tag) > -1 && sorted.push(tag);
  });

  // all other tagged versions descending
  const other = semverSort.desc(unsorted.filter(tag => channels.indexOf(tag) === -1));

  sorted = sorted.concat(other).map((pv) => {
    return {
      version: pv,
      path: `/docs/${ project }/${ pv }`
    };
  })

  data.push({
    project: project,
    path: `/docs/${ project }`,
    versions: sorted
  });

});

// write json for jekyll (and browser)
jsonfile.writeFileSync('./_data/projects.json', data);