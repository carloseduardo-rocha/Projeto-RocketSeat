function toggleMode() {
  const html = document.documentElement
  const img = document.querySelector("#profile img")
  html.classList.toggle("light")

  if (html.classList.contains('light')) {
    img.setAttribute('src', './assets/avatar-light.png')
    img.setAttribute("alt", "Foto de Carlos Eduardo, com barba, cabelo solto, na empresa Alares.")
  }
  else {
    img.setAttribute("src", "./assets/avatar.png")
    img.setAttribute("alt", "Foto de Carlos Eduardo, sorrindo, com barba, cabelo amarrado, no Senac.")
  }
}
