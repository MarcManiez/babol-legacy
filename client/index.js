const app = {
  init() {
      // do nothing
        // cookies are the right tool for the job in this instance, because they are sent with every request
        // this makes it a better experience when it comes to redirecting users to their streaming service.
        // if we did it with JWT, there would first be a get request to /link/:id
        // after that response, the javascript is read, and the JWT sent back to the server for a porential redirection. This is bad.
        // Using a cookie, the correct information will be included from the get-go and the redirect will be seamless.
  },
  getLinks(event) {
    return new Promise((resolve, reject) => {
      event.preventDefault();
      const link = document.getElementById('link').value;
      const httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
          resolve(JSON.parse(httpRequest.responseText));
        } else if (httpRequest.status !== 200 && httpRequest.readyState !== 1) {
          console.error(httpRequest);
          reject(httpRequest);
        }
      };
      httpRequest.open('POST', `${window.location.href}api/link/`, true);
      httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      httpRequest.send(`link=${link}`);
    });
  },
  update(response) {
    const type = response.type;
    app.links.babol = `${window.location.href}link/${response.id}`;
    for (let i = 0; i < app.services.length; i += 1) {
      app.links[app.services[i]] = response[app.services[i]];
    }
    app.content.artist = response.artist.name;
    if (type === 'album' || type === 'song') {
      app.content.album = response.album.name;
    }
    if (type === 'song') {
      app.content.song = response.song.name;
    }
    document.getElementById('permalink').children[0].value = app.links.babol;
  },
  content: {
    artist: null,
    album: null,
    song: null,
  },
  links: {},
  services: ['apple', 'spotify'],
  service: null,
};
