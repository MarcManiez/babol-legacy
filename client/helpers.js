const httpRequest = (method, url, options) => new Promise((resolve, reject) => {
  const { body } = options;
  const request = new XMLHttpRequest();
  request.onreadystatechange = () => {
    if (request.readyState === XMLHttpRequest.DONE && request.status.toString().match(/^[23]\d\d/)) {
      resolve(JSON.parse(request.responseText));
    } else if (request.status !== 200 && request.readyState !== 1) {
      console.error(request);
      reject(request);
    }
  };
  request.open(method, url, true);
  if (method === 'POST') {
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  }
  request.send(body);
});
