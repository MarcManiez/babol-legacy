const app = {
  getService(event) {
    // get the current value
    // cookies are the right tool for the job in this instance, because they are sent with every request
    // this makes it a better experience when it comes to redirecting users to their streaming service.
    // if we did it with JWT, there would first be a get request to /link/:id
    // after that response, the javascript is read, and the JWT sent back to the server for a porential redirection. This is bad.
    // Using a cookie, the correct information will be included from the get-go and the redirect will be seamless.
  },
  setService() {
    const service = this.options[this.selectedIndex].value;
    return helpers.httpRequest('POST', `${window.location.href}api/service/`, { body: `service=${service}` })
    .then((response) => {
      app.service = response.service;
    });
  },
  getLinks(event) {
    event.preventDefault();
    const link = document.getElementById('link').value;
    return helpers.httpRequest('POST', `${window.location.href}api/link/`, { body: `link=${link}` });
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
