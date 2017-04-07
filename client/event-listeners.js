// const slide = function () {
//   // debugger;
//   const sliders = document.getElementById('permalink').children;
//   for (const node of sliders) {
//     node.className += ' slide';
//   }
// };

if (document.getElementById('search')) {
  const form = document.querySelector('form');
  form.addEventListener('submit', helpers.translateLink);

  const copy = document.getElementById('permalink').children[1];
  copy.onclick = helpers.copyToClipboard;

  const serviceSelection = document.querySelector('.service-selection').querySelector('select');
  serviceSelection.onchange = app.setService;
}

if (document.getElementById('links')) {
  const links = document.getElementsByClassName('link');
  for (const node of links) node.lastChild.onclick = helpers.copyToClipboard;
}

