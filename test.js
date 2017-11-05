p1().then(p4).then(p2).then(p3)
  .then(function (data) {
    console.log('data: ' + data);
  })
  .catch(function (error) {
    console.log('error: ' + error);
  });

function p1() {
  return new Promise(function (resolve, reject) {
    console.log('p1 resolved');
    resolve(123);
  });
}

function p2() {
  return new Promise(function (resolve, reject) {
    console.log('p2 rejected');
    reject(456);
  });
}

function p3() {
  return new Promise(function (resolve, reject) {
    console.log('p3 resolved');
    resolve(789);
  });
}

function p4(resolve, reject) {
  return new Promise(function (resolve, reject) {
    reject('000')
  });
}
