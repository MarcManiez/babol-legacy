const app = {
  getLinks(event) {
    event.preventDefault();
    const link = document.getElementById('link').value;
    const httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
        app.update(JSON.parse(httpRequest.responseText));
        // slide();
      } else if (httpRequest.status !== 200 && httpRequest.readyState !== 1) {
        console.error(httpRequest);
      }
    };
    httpRequest.open('POST', 'http://localhost:8000/api/link/', true);
    httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    httpRequest.send(`link=${link}`);
  },
  update(response) {
    const type = response.type;
    app.links.babol = `http://localhost:8000/link/${response.id}`;
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
    document.getElementById('permalink').children[0].value = app.links.babol.slice(7);
  },
  content: {
    artist: null,
    album: null,
    song: null,
  },
  links: {},
  services: ['apple', 'spotify'],
};
