const coll = document.getElementsByClassName('collapsible');
let i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener('click', (event: Event) => {
    const target = event.currentTarget as HTMLElement;
    target.classList.toggle('active');
    const content = target.nextElementSibling as HTMLElement;
    if (content.style.maxHeight) {
      content.style.maxHeight = '';
    } else {
      content.style.maxHeight = `${content.scrollHeight}px`;
    }
  });
}
