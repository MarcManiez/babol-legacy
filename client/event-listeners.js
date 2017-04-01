// const slide = function () {
//   // debugger;
//   const sliders = document.getElementById('permalink').children;
//   for (const node of sliders) {
//     node.className += ' slide';
//   }
// };

const form = document.querySelector('form');
form.addEventListener('submit', app.getLinks);
// form.addEventListener('submit', slide);

const copy = document.getElementById('permalink').children[1];
copy.onclick = function (e) {
  document.getElementById('permalink').children[0].select();
  document.execCommand('copy');
};
