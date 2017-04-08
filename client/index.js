const app = {
  getService(event) {
    const service = document.cookie.split('=')[1];
    const option = document.querySelector(`option[value=${service}]`);
    if (option) option.selected = true;
    return service;
  },
  setService(service) {
    document.cookie = `service=${service}; path=/ ; ${!service ? ' expires=Thu, 01 Jan 1970 00:00:01 GMT;' : ''}`;
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
  init() {
    app.getService();
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

app.init();
