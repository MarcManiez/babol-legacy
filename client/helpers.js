const helpers = {};

helpers.httpRequest = (method, url, options) => new Promise((resolve, reject) => {
  const { body } = options;
  const request = new XMLHttpRequest();
  request.onreadystatechange = () => {
    if (request.readyState === XMLHttpRequest.DONE && request.status.toString().match(/^[23]\d\d/)) {
      resolve(JSON.parse(request.responseText));
    } else if (!request.status.toString().match(/^[23]\d\d/) && request.readyState !== 1) {
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

helpers.copyToClipboard = (e) => {
  e.target.previousSibling.previousSibling.select();
  document.execCommand('copy');
};

helpers.translateLink = e => app.getLinks(e)
.then((response) => {
  app.update(response);
  // form.addEventListener('submit', slide);
});

helpers.setServiceClip = function () {
  app.setService(this.name);
};

helpers.setServiceSelect = function () {
  const service = this.options[this.selectedIndex].value;
  app.setService(service);
};
