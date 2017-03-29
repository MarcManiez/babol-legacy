const app = {
  getLinks(event) {
    event.preventDefault();
    const link = document.getElementById('link').value;
    const httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
        console.log(httpRequest.responseText);
      } else if (httpRequest.status !== 200 && httpRequest.readyState !== 1) {
        console.error(httpRequest);
      }
    };
    httpRequest.open('POST', 'http://localhost:8000/api/link/', true);
    httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    httpRequest.send(`link=${link}`);
  },
};
