

const dirs = {
  name: 'dir1',
  parent: {
    name: 'dir2',
    parent: {
      name: 'dir3',
      parent: {
        name: 'dir4',
        parent: {
          name: 'dir5',
          parent: {
            name: 'dir6',
            parent: {
              name: 'dir7',
              parent: {
                name: 'dir8',
                parent: {
                  name: 'dir9',
                  parent: {
                    name: 'dir10',
                    parent: null
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

let path = '';

function getPath(dirs) {
  if (dirs.parent === null) {
    return dirs.name;
  }
  return getPath(dirs.parent) + '/' + dirs.name;
}

console.log(getPath(dirs));