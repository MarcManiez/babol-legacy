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
    const type = helpers.typeSwitch[response.slug[0]];
    app.links.babol = `${window.location.href}link/${response.slug}`;
    for (let i = 0; i < app.services.length; i += 1) {
      app.links[app.services[i]] = response[`${app.services[i]}_url`];
    }
    app.content.image = response.image ? response.image.url : null;
    if (type === 'artist') {
      app.content.artist = response.name;
    }
    if (type === 'album') {
      app.content.artist = response.artist.name;
      app.content.album = response.name;
    }
    if (type === 'song') {
      app.content.artist = response.artist.name;
      app.content.album = response.album.name;
      app.content.song = response.name;
    }
    document.querySelector('#permalink input').value = app.links.babol;
    return app.links.babol;
  },
  init() {
    app.getService();
  },
  content: {
    artist: null,
    album: null,
    song: null,
    image: null,
  },
  links: {},
  services: ['apple', 'spotify'],
  service: null,
};

app.init();
