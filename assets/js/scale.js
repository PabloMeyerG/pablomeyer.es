/* Pantallas grandes: la web esta maquetada a 1440 px. Por encima de ese
   ancho se escala entera en proporcion (zoom) en lugar de quedarse
   pequena en el centro. Va en el <head> para que no haya salto al cargar.

   Con zoom, algunos navegadores multiplican tambien vh/vw y otros no.
   En vez de suponerlo, se mide: --z (alturas en vh) y --zw (anchos en vw)
   valen lo que haya que dividir para que 100vh siga siendo la pantalla.
   Sin zoom, o en un navegador que no los multiplica, valen 1. */
(function () {
  var BASE = 1440, MAX = 2, root = document.documentElement;

  function factor(prop, unit) {
    var box = document.createElement('div');
    var probe = document.createElement('div');
    box.style.cssText = 'position:fixed;inset:0;visibility:hidden;pointer-events:none';
    probe.style.cssText = 'position:absolute;top:0;left:0;' + prop + ':100' + unit;
    box.appendChild(probe);
    root.appendChild(box);
    var a = probe.getBoundingClientRect()[prop], b = box.getBoundingClientRect()[prop];
    root.removeChild(box);
    var f = a / b;
    return f > 1.01 ? f : 1;
  }

  function fit() {
    var z = Math.min(MAX, Math.max(1, window.innerWidth / BASE));
    root.style.zoom = z > 1 ? z : '';
    root.style.setProperty('--z', z > 1 ? factor('height', 'vh') : 1);
    root.style.setProperty('--zw', z > 1 ? factor('width', 'vw') : 1);
  }
  fit();
  window.addEventListener('resize', fit);
})();
