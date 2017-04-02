// const slide = function () {
//   // debugger;
//   const sliders = document.getElementById('permalink').children;
//   for (const node of sliders) {
//     node.className += ' slide';
//   }
// };

const copyToClipboard = (e) => {
  e.target.previousSibling.previousSibling.select();
  document.execCommand('copy');
};

if (document.getElementById('search')) {
  const form = document.querySelector('form');
  form.addEventListener('submit', app.getLinks);
  // form.addEventListener('submit', slide);
  const copy = document.getElementById('permalink').children[1];
  copy.onclick = copyToClipboard;
}

if (document.getElementById('links')) {
  const links = document.getElementsByClassName('link');
  for (const node of links) node.lastChild.onclick = copyToClipboard;
}
